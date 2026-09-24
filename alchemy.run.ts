import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "tugas-3-tmdb",
  {
    providers: Cloudflare.providers(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const site = yield* Cloudflare.Website.Nuxt("Website", {
      rootDir: "apps/tugas-3-tmdb",
      domain: "tmdb.alfanso.xyz",
      env: {
        NUXT_TMDB_API_KEY: Config.Redacted("NUXT_TMDB_API_KEY"),
      },
    });

    return { url: site.url };
  }),
);
