import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import Home from '@/views/Home.vue'

// Mock the router
const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush
    })
  }
})

// Mock the API instead of the store
vi.mock('@/services/api', () => ({
  userApi: {
    create: vi.fn(),
    get: vi.fn(),
  },
  householdApi: {
    create: vi.fn(),
    join: vi.fn(),
    get: vi.fn(),
    updateSettings: vi.fn(),
  }
}))

import { userApi } from '@/services/api'

describe('Home.vue', () => {
  let wrapper: any
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: Home }]
    })

    wrapper = mount(Home, {
      global: {
        plugins: [router, pinia]
      }
    })

    vi.clearAllMocks()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true
    })
  })

  it('renders welcome message', () => {
    expect(wrapper.text()).toContain('Split Personality')
    expect(wrapper.text()).toContain('Fair and transparent household chore management')
  })

  it('has input field for first name', () => {
    const input = wrapper.find('input[type="text"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('Enter your first name')
  })

  it('disables submit button when no name entered', () => {
    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('enables submit button when name is entered', async () => {
    const input = wrapper.find('input[type="text"]')
    await input.setValue('Alice')

    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('shows loading state when creating user', async () => {
    // Create a mock that takes a while to resolve
    vi.mocked(userApi.create).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    const input = wrapper.find('input[type="text"]')
    await input.setValue('Alice')

    // Start the form submission
    wrapper.vm.handleSubmit()
    await wrapper.vm.$nextTick()

    const button = wrapper.find('button[type="submit"]')
    expect(button.text()).toContain('Creating...')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('calls createUser and navigates on form submit', async () => {
    const mockUser = { id: 'user1', firstName: 'Alice', householdId: null, createdAt: '2023-01-01', updatedAt: '2023-01-01' }
    vi.mocked(userApi.create).mockResolvedValue({ data: { data: { user: mockUser } } } as any)

    const input = wrapper.find('input[type="text"]')
    await input.setValue('Alice')

    // Call the handleSubmit method directly
    await wrapper.vm.handleSubmit()

    expect(userApi.create).toHaveBeenCalledWith('Alice')
    expect(mockPush).toHaveBeenCalledWith('/onboarding')
  })

  it('handles createUser error gracefully', async () => {
    vi.mocked(userApi.create).mockRejectedValue(new Error('Creation failed'))
    
    // Mock console.error to avoid test output noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const input = wrapper.find('input[type="text"]')
    await input.setValue('Alice')

    // Call the handleSubmit method directly
    await wrapper.vm.handleSubmit()

    expect(userApi.create).toHaveBeenCalledWith('Alice')
    expect(mockPush).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith('Failed to create user:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('trims whitespace from input', async () => {
    const mockUser = { id: 'user1', firstName: 'Alice', householdId: null, createdAt: '2023-01-01', updatedAt: '2023-01-01' }
    vi.mocked(userApi.create).mockResolvedValue({ data: { data: { user: mockUser } } } as any)

    const input = wrapper.find('input[type="text"]')
    await input.setValue('  Alice  ')

    // Call the handleSubmit method directly
    await wrapper.vm.handleSubmit()
    
    expect(userApi.create).toHaveBeenCalledWith('Alice')
  })

  it('does not submit when input is only whitespace', async () => {
    const input = wrapper.find('input[type="text"]')
    await input.setValue('   ')

    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()

    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(userApi.create).not.toHaveBeenCalled()
  })
})