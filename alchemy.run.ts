import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
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
    });

    return { url: site.url };
  }),
);
