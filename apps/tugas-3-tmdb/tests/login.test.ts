// @vitest-environment happy-dom
import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'
import LoginPage from '../app/pages/login.vue'
import { authClient } from '../app/lib/auth-client'

vi.mock('../app/lib/auth-client', () => ({
  authClient: { signIn: { social: vi.fn().mockResolvedValue({ error: null }) } },
}))

afterEach(() => vi.unstubAllGlobals())

it('starts Google sign in and returns to the film catalogue', async () => {
  const refresh = vi.fn().mockResolvedValue(null)
  vi.stubGlobal('useAuth', () => ({
    user: shallowRef(null), configured: shallowRef(true), ready: shallowRef(true), refresh,
  }))
  vi.stubGlobal('useRoute', () => ({ query: {} }))
  vi.stubGlobal('useHead', () => {})

  const wrapper = mount(LoginPage, {
    global: { stubs: {
      Button: { template: '<button :disabled="disabled" @click="$emit(\'click\')">{{ label }}</button>', props: ['disabled', 'label'] },
      Message: true,
      NuxtLink: true,
    } },
  })
  await wrapper.get('button').trigger('click')
  await flushPromises()

  expect(refresh).toHaveBeenCalled()
  expect(authClient.signIn.social).toHaveBeenCalledWith({ provider: 'google', callbackURL: '/' })
})

it('disables sign in when server configuration is missing', () => {
  vi.stubGlobal('useAuth', () => ({
    user: shallowRef(null), configured: shallowRef(false), ready: shallowRef(true), refresh: vi.fn().mockResolvedValue(null),
  }))
  vi.stubGlobal('useRoute', () => ({ query: {} }))
  vi.stubGlobal('useHead', () => {})

  const wrapper = mount(LoginPage, {
    global: { stubs: {
      Button: { template: '<button :disabled="disabled">{{ label }}</button>', props: ['disabled', 'label'] },
      Message: { template: '<p><slot /></p>' },
    } },
  })

  expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  expect(wrapper.text()).toContain('Google sign in is not configured')
})

it('returns to the protected page after Google sign in', async () => {
  vi.stubGlobal('useAuth', () => ({
    user: shallowRef(null), configured: shallowRef(true), ready: shallowRef(true), refresh: vi.fn().mockResolvedValue(null),
  }))
  vi.stubGlobal('useRoute', () => ({ query: { redirect: '/dashboard' } }))
  vi.stubGlobal('useHead', () => {})

  const wrapper = mount(LoginPage, {
    global: { stubs: {
      Button: { template: '<button @click="$emit(\'click\')">{{ label }}</button>', props: ['label'], emits: ['click'] },
      Message: true,
      NuxtLink: true,
    } },
  })
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(authClient.signIn.social).toHaveBeenCalledWith({ provider: 'google', callbackURL: '/dashboard' })
})
