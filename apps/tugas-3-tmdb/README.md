# Frame

A Nuxt film catalogue powered by TMDB. Sign in uses Google through Better Auth; PostgreSQL stores auth data and each user's watchlist through Drizzle.

## Local setup

Install dependencies with `pnpm install`. Create `.env` in this directory with these server-side values:

```dotenv
NUXT_TMDB_API_KEY=
DATABASE_URL=postgres://user:password@localhost:5432/frame
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Use a random secret of at least 32 characters for `BETTER_AUTH_SECRET`. In Google Cloud Console, configure the OAuth web application's authorized redirect URI as `http://localhost:3000/api/auth/callback/google`. Use the deployed origin instead of localhost in production.

Apply the included migrations with `pnpm db:migrate`, then start the app with `pnpm dev`. Signed-in users can save films from the catalogue or detail page and manage them at `/dashboard`. Run `pnpm test`, `pnpm exec nuxt typecheck`, and `pnpm build` to verify changes.

TMDB data is fetched only by Nuxt server routes. Google and database credentials stay on the server.
