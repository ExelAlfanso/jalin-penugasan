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
        DATABASE_URL: Config.Redacted("DATABASE_URL"),
        BETTER_AUTH_SECRET: Config.Redacted("BETTER_AUTH_SECRET"),
        BETTER_AUTH_URL: Config.String("BETTER_AUTH_URL"),
        GOOGLE_CLIENT_ID: Config.Redacted("GOOGLE_CLIENT_ID"),
        GOOGLE_CLIENT_SECRET: Config.Redacted("GOOGLE_CLIENT_SECRET"),
      },
    });

    return { url: site.url };
  }),
);
