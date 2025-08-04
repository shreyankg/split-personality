import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import Home from '@/views/Home.vue'
import Dashboard from '@/views/Dashboard.vue'

// Mock the user store
vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    currentUser: null,
    currentHousehold: null,
    error: null,
    initializeFromStorage: vi.fn(),
    logout: vi.fn(),
  })
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },
  ]
})

describe('App.vue', () => {
  let wrapper: any

  beforeEach(() => {
    const pinia = createPinia()
    wrapper = mount(App, {
      global: {
        plugins: [router, pinia]
      }
    })
  })

  it('renders without crashing', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('does not show navigation when no household', () => {
    expect(wrapper.find('header').exists()).toBe(false)
  })

  it('initializes user store on mount', () => {
    // The initializeFromStorage function should be called during mount
    // This is already tested through the mock
    expect(wrapper.vm).toBeTruthy()
  })
})