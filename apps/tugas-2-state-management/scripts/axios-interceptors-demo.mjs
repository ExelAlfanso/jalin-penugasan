/**
 * Scratch demo: use case axios interceptors. Dijalankan nyata dengan HTTP server lokal.
 * Run: node .scratch-axios-interceptors.mjs
 */
import http from "node:http";
import axios from "axios";

const PORT = 53123;
const BASE = `http://127.0.0.1:${PORT}`;

const hits = {
  ok: 0,
  refresh: 0,
  protectedOk: 0,
  protected401: 0,
  flaky: 0,
  slow: 0,
  echo: 0,
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, BASE);
  const auth = req.headers.authorization ?? null;
  const requestId = req.headers["x-request-id"] ?? null;
  const send = (status, body) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(body ?? null));
  };

  if (url.pathname === "/ok") {
    hits.ok++;
    return send(200, { ok: true, auth, requestId });
  }
  if (url.pathname === "/echo") {
    hits.echo++;
    return send(200, { auth, requestId });
  }
  if (url.pathname === "/refresh") {
    hits.refresh++;
    return send(200, { token: "fresh-token" });
  }
  if (url.pathname === "/protected") {
    if (auth === "Bearer fresh-token") {
      hits.protectedOk++;
      return send(200, { data: "rahasia", auth });
    }
    hits.protected401++;
    return send(401, { message: "token expired" });
  }
  if (url.pathname === "/flaky") {
    hits.flaky++;
    if (hits.flaky <= 2) return send(503, { message: "coba lagi" });
    return send(200, { attempt: hits.flaky });
  }
  if (url.pathname === "/slow") {
    hits.slow++;
    setTimeout(() => send(200, { slow: true, requestId }), 150);
    return;
  }
  send(404, { message: "not found" });
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));

const failures = [];
function check(label, pass, detail = "") {
  if (!pass) failures.push(label);
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${detail ? `  -> ${detail}` : ""}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 1. URUTAN INTERCEPTOR ────────────────────────────────────────────────
console.log("\n[1] urutan eksekusi interceptor");
{
  const order = [];
  const inst = axios.create({ baseURL: BASE });
  inst.interceptors.request.use((c) => {
    order.push("req:A");
    return c;
  });
  inst.interceptors.request.use((c) => {
    order.push("req:B");
    return c;
  });
  inst.interceptors.response.use((r) => {
    order.push("res:C");
    return r;
  });
  inst.interceptors.response.use((r) => {
    order.push("res:D");
    return r;
  });
  await inst.get("/ok");

  check(
    "request interceptor = LIFO (terakhir didaftarkan, pertama jalan)",
    JSON.stringify(order.filter((o) => o.startsWith("req"))) === '["req:B","req:A"]',
    order.join(" -> "),
  );
  check(
    "response interceptor = FIFO (pertama didaftarkan, pertama jalan)",
    JSON.stringify(order.filter((o) => o.startsWith("res"))) === '["res:C","res:D"]',
    order.join(" -> "),
  );
}

// ── 2. INTERCEPTOR ASYNC DI-AWAIT + BENTUK headers ───────────────────────
console.log("\n[2] request interceptor boleh async (di-await)");
{
  const inst = axios.create({ baseURL: BASE });
  let headersCtor = "";
  inst.interceptors.request.use(async (c) => {
    headersCtor = c.headers?.constructor?.name ?? typeof c.headers;
    await sleep(30); // simulasi ambil token dari storage/refresh
    c.headers.Authorization = "Bearer async-token";
    return c;
  });
  const { data } = await inst.get("/echo");
  check("header terpasang setelah await", data.auth === "Bearer async-token", `auth=${data.auth}`);
  check("tipe config.headers di interceptor terlihat", true, headersCtor);
}

// ── 3. SKIP AUTH PER REQUEST (flag custom) ───────────────────────────────
console.log("\n[3] flag custom per request (skipAuth)");
{
  let token = "abc123";
  const inst = axios.create({ baseURL: BASE });
  inst.interceptors.request.use((c) => {
    if (!c.skipAuth && token) c.headers.Authorization = `Bearer ${token}`;
    return c;
  });

  const withAuth = await inst.get("/echo");
  const withoutAuth = await inst.get("/echo", { skipAuth: true });
  check("default -> header terpasang", withAuth.data.auth === "Bearer abc123", `auth=${withAuth.data.auth}`);
  check("skipAuth -> header tidak dipasang", withoutAuth.data.auth === null, `auth=${withoutAuth.data.auth}`);
}

// ── 4. REFRESH TOKEN SINGLE-FLIGHT (401) ────────────────────────────────
console.log("\n[4] 401 -> refresh sekali, lalu retry (single-flight)");
{
  let token = "stale-token";
  let refreshPromise = null;
  const inst = axios.create({ baseURL: BASE });

  inst.interceptors.request.use((c) => {
    c.headers.Authorization = `Bearer ${token}`;
    return c;
  });

  inst.interceptors.response.use(undefined, async (error) => {
    const config = error.config;
    if (error.response?.status === 401 && config && !config._retry) {
      config._retry = true;
      refreshPromise ??= axios
        .get(`${BASE}/refresh`)
        .then((r) => r.data.token)
        .finally(() => {
          refreshPromise = null;
        });
      token = await refreshPromise;
      config.headers.Authorization = `Bearer ${token}`;
      return inst.request(config);
    }
    return Promise.reject(error);
  });

  const started = Date.now();
  const results = await Promise.all([
    inst.get("/protected"),
    inst.get("/protected"),
    inst.get("/protected"),
  ]);

  check("3 request paralel -> /refresh dipanggil 1x", hits.refresh === 1, `refresh hits=${hits.refresh}`);
  check(
    "ketiganya berhasil setelah retry",
    results.every((r) => r.data.data === "rahasia"),
    results.map((r) => r.data.auth).join(", "),
  );
  check("401 pertama tercatat dari server", hits.protected401 === 3, `401 hits=${hits.protected401}`, );
  console.log(`      (selesai dalam ${Date.now() - started} ms → 1 refresh untuk 3 request)`);
}

// ── 5. RETRY + BACKOFF UNTUK 5xx ────────────────────────────────────────
console.log("\n[5] retry otomatis + backoff untuk error server (5xx)");
{
  const before = hits.flaky;
  const inst = axios.create({ baseURL: BASE });
  inst.interceptors.response.use(undefined, async (error) => {
    const config = error.config;
    const status = error.response?.status;
    const maxRetry = 2;
    if (!config || config._retryCount === undefined) config._retryCount = 0;
    const retryable = status >= 500 || !error.response;
    if (retryable && config._retryCount < maxRetry) {
      config._retryCount += 1;
      await sleep(20 * config._retryCount); // 20ms, 40ms (di produksi: 200ms, 400ms, jitter)
      return inst.request(config);
    }
    return Promise.reject(error);
  });

  const { data } = await inst.get("/flaky");
  const attempts = hits.flaky - before;
  check("berhasil setelah retry", data.attempt === 3, `attempt=${data.attempt}`);
  check("total percobaan ke server = 3", attempts === 3, `attempts=${attempts}`);
}

// ── 6. DEDUPE REQUEST IDENTIK YANG MASIH IN-FLIGHT ──────────────────────
console.log("\n[6] dedupe GET identik yang masih berjalan");
{
  const before = hits.slow;
  const inflight = new Map();
  const inst = axios.create({ baseURL: BASE });
  // di axios v1, defaults.adapter berisi DAFTAR nama adapter, bukan fungsi
  console.log(
    `      (defaults.adapter = ${JSON.stringify(inst.defaults.adapter)} -> resolve via axios.getAdapter)`,
  );
  const rawAdapter = axios.getAdapter(inst.defaults.adapter);

  inst.defaults.adapter = async (config) => {
    if (config.method !== "get" || config.dedupe === false) return rawAdapter(config);
    const key = `${config.method}:${config.url}:${JSON.stringify(config.params ?? {})}`;
    if (!inflight.has(key)) {
      const pending = rawAdapter(config).finally(() => inflight.delete(key));
      inflight.set(key, pending);
    }
    return inflight.get(key);
  };

  const [a, b] = await Promise.all([inst.get("/slow"), inst.get("/slow")]);
  const attempts = hits.slow - before;
  check("2 request paralel -> server hanya disentuh 1x", attempts === 1, `server hits=${attempts}`);
  check("keduanya menerima data yang sama", a.data.slow === true && b.data.slow === true);
}

// ── 7. GLOBAL LOADING COUNTER ───────────────────────────────────────────
console.log("\n[7] loading counter global (progress bar)");
{
  let active = 0;
  const samples = [];
  const inst = axios.create({ baseURL: BASE });
  inst.interceptors.request.use((c) => {
    active += 1;
    samples.push(active);
    c._loadingTracked = true;
    return c;
  });
  inst.interceptors.response.use(
    (r) => {
      if (r.config._loadingTracked) active -= 1;
      samples.push(active);
      return r;
    },
    (error) => {
      if (error.config?._loadingTracked) active -= 1;
      samples.push(active);
      return Promise.reject(error);
    },
  );

  await Promise.all([inst.get("/slow"), inst.get("/slow"), inst.get("/ok")]);
  check("counter naik saat paralel (peak >= 2)", Math.max(...samples) >= 2, `samples=${samples.join(",")}`);
  check("counter kembali 0 setelah semua selesai", active === 0, `active=${active}`);

  await inst.get("/nope-404").catch(() => undefined);
  check("error juga menurunkan counter (tidak nyangkut)", active === 0, `active=${active}`);
}

// ── 8. NORMALISASI ERROR ────────────────────────────────────────────────
console.log("\n[8] normalisasi error jadi satu bentuk");
{
  function normalize(error) {
    if (axios.isCancel(error)) return { kind: "canceled", message: "Dibatalkan" };
    if (!error.response) {
      return error.code === "ECONNABORTED"
        ? { kind: "timeout", message: "Server terlalu lama merespons" }
        : { kind: "network", message: "Tidak bisa menghubungi server" };
    }
    const status = error.response.status;
    const serverMessage = error.response.data?.message;
    const kind = status === 401 ? "unauthorized" : status === 404 ? "notfound" : status >= 500 ? "server" : "client";
    return { kind, status, message: serverMessage ?? error.message };
  }

  const inst = axios.create({ baseURL: BASE });
  inst.interceptors.response.use(undefined, (error) => Promise.reject(normalize(error)));

  const http404 = await inst.get("/nope-404").catch((e) => e);
  check("404 -> { kind: notfound }", http404.kind === "notfound", JSON.stringify(http404));

  const timeoutInstance = axios.create({ baseURL: BASE, timeout: 50 });
  timeoutInstance.interceptors.response.use(undefined, (error) => Promise.reject(normalize(error)));
  const timeoutErr = await timeoutInstance.get("/slow").catch((e) => e);
  check("timeout -> { kind: timeout }", timeoutErr.kind === "timeout", JSON.stringify(timeoutErr));

  const offline = axios.create({ baseURL: "http://127.0.0.1:1" });
  offline.interceptors.response.use(undefined, (error) => Promise.reject(normalize(error)));
  const netErr = await offline.get("/x").catch((e) => e);
  check("server mati -> { kind: network }", netErr.kind === "network", JSON.stringify(netErr));
}

// ── 9. CORRELATION ID + DURASI ──────────────────────────────────────────
console.log("\n[9] correlation id + logging durasi");
{
  const logs = [];
  const inst = axios.create({ baseURL: BASE });
  inst.interceptors.request.use((c) => {
    c.headers["X-Request-Id"] = crypto.randomUUID().slice(0, 8);
    c._startedAt = Date.now();
    return c;
  });
  inst.interceptors.response.use((r) => {
    logs.push({ id: r.config.headers["X-Request-Id"], ms: Date.now() - r.config._startedAt });
    return r;
  });

  const { data } = await inst.get("/ok");
  check("request id sampai ke server", data.requestId === logs[0].id, `id=${logs[0].id} (server melihat id yang sama)`);
  check("durasi tercatat", typeof logs[0].ms === "number", `${logs[0].ms} ms`);
}

// ── 10. CANCEL VIA AbortController ──────────────────────────────────────
console.log("\n[10] cancel request (AbortController)");
{
  let active = 0;
  const inst = axios.create({ baseURL: BASE });
  inst.interceptors.request.use((c) => {
    active += 1;
    return c;
  });
  inst.interceptors.response.use(
    (r) => {
      active -= 1;
      return r;
    },
    (error) => {
      active -= 1;
      return Promise.reject(error);
    },
  );

  const controller = new AbortController();
  setTimeout(() => controller.abort(), 20);
  const err = await inst.get("/slow", { signal: controller.signal }).catch((e) => e);
  check("axios.isCancel(error) === true", axios.isCancel(err) === true, `code=${err.code}`);
  check("error instanceof CanceledError", err instanceof axios.CanceledError, err.constructor.name);
  check("counter tetap konsisten setelah cancel", active === 0, `active=${active}`);
}

// ── 11. ADAPTER OVERRIDE UNTUK TEST (tanpa jaringan) ─────────────────────
console.log("\n[11] adapter override untuk test/pemakaian non-network");
{
  const before = hits.ok;
  const inst = axios.create({
    baseURL: "https://api-palsu.invalid",
    adapter: async (config) => ({
      data: { items: [1, 2, 3], url: config.url },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }),
  });
  const { data } = await inst.get("/whatever");
  check("data dari adapter, tidak menyentuh server", hits.ok === before && data.items.length === 3, JSON.stringify(data));
}

// ── RINGKASAN ───────────────────────────────────────────────────────────
server.close();
console.log(`\n=== ${failures.length === 0 ? "SEMUA PASS" : `${failures.length} FAIL`} ===`);
if (failures.length) {
  console.log(failures.join("\n"));
  process.exitCode = 1;
}
