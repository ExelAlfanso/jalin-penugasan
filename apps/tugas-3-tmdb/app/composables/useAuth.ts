import { authClient } from '../lib/auth-client'

export interface AuthUser { id: string; name: string; email: string }

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const configured = useState<boolean>('auth-configured', () => false)
  const ready = useState<boolean>('auth-ready', () => false)

  async function refresh() {
    const result = await $fetch<{ user: AuthUser | null; configured: boolean }>('/api/auth/status')
    user.value = result.user
    configured.value = result.configured
    ready.value = true
    return result.user
  }

  async function logout() {
    const result = await authClient.signOut()
    if (result.error) throw result.error
    user.value = null
  }

  return { user, configured, ready, refresh, logout }
}
