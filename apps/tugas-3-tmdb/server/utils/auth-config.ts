export function isAuthConfigured() {
  return Boolean(
    process.env.DATABASE_URL &&
    process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_SECRET.length >= 32 &&
    process.env.BETTER_AUTH_URL &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET,
  )
}
