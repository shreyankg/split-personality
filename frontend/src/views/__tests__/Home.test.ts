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

// Mock the user store
const mockCreateUser = vi.fn()
const mockUserStore = {
  isLoading: false,
  createUser: mockCreateUser,
}

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore
}))

describe('Home.vue', () => {
  let wrapper: any

  beforeEach(() => {
    const pinia = createPinia()
    const router = createRouter({
      history: createWebHistory(),
      routes: []
    })

    wrapper = mount(Home, {
      global: {
        plugins: [router, pinia]
      }
    })

    vi.clearAllMocks()
  })

  it('renders welcome message', () => {
    expect(wrapper.text()).toContain('Chore Equity')
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
    mockUserStore.isLoading = true
    
    const wrapper = mount(Home, {
      global: {
        plugins: [router, pinia]
      }
    })

    await wrapper.vm.$nextTick()

    const button = wrapper.find('button[type="submit"]')
    expect(button.text()).toContain('Creating...')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('calls createUser and navigates on form submit', async () => {
    mockCreateUser.mockResolvedValue({ id: 'user1', firstName: 'Alice' })

    const input = wrapper.find('input[type="text"]')
    await input.setValue('Alice')

    // Trigger the submit event directly on the form element
    await wrapper.find('form').trigger('submit')

    // Wait for Vue's reactivity and promises to resolve
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockCreateUser).toHaveBeenCalledWith('Alice')
    expect(mockPush).toHaveBeenCalledWith('/onboarding')
  })

  it('handles createUser error gracefully', async () => {
    mockCreateUser.mockRejectedValue(new Error('Creation failed'))
    
    // Mock console.error to avoid test output noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const input = wrapper.find('input[type="text"]')
    await input.setValue('Alice')

    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockCreateUser).toHaveBeenCalledWith('Alice')
    expect(mockPush).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith('Failed to create user:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('trims whitespace from input', async () => {
    mockCreateUser.mockResolvedValue({ id: 'user1', firstName: 'Alice' })

    const input = wrapper.find('input[type="text"]')
    await input.setValue('  Alice  ')

    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockCreateUser).toHaveBeenCalledWith('Alice')
  })

  it('does not submit when input is only whitespace', async () => {
    const input = wrapper.find('input[type="text"]')
    await input.setValue('   ')

    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()

    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(mockCreateUser).not.toHaveBeenCalled()
  })
})