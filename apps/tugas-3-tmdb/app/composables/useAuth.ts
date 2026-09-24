export interface AuthUser { id: number; username: string }

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)

  async function refresh() {
    const result = await $fetch<{ user: AuthUser | null }>('/api/auth/status')
    user.value = result.user
    return result.user
  }

  async function logout() {
    const result = await $fetch<{ loggedOut: boolean; remoteSessionRevoked: boolean }>('/api/auth/logout', { method: 'POST' })
    user.value = null
    return result
  }

  return { user, refresh, logout }
}
