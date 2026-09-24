export default defineNuxtRouteMiddleware(async (to) => {
  const { refresh } = useAuth()
  try {
    if (await refresh()) return
  } catch {
    return navigateTo({ path: '/login', query: { redirect: to.path, error: 'unavailable' } })
  }
  return navigateTo({ path: '/login', query: { redirect: to.path } })
})
