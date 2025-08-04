import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

// Mock the API
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

import { userApi, householdApi } from '@/services/api'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Clear localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true
    })
  })

  it('creates user successfully', async () => {
    const mockUser = {
      id: 'user1',
      firstName: 'Alice',
      householdId: null,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    }

    vi.mocked(userApi.create).mockResolvedValue({
      data: { data: { user: mockUser } }
    } as any)

    const store = useUserStore()
    const result = await store.createUser('Alice')

    expect(userApi.create).toHaveBeenCalledWith('Alice')
    expect(store.currentUser).toEqual(mockUser)
    expect(localStorage.setItem).toHaveBeenCalledWith('userId', 'user1')
    expect(result).toEqual(mockUser)
  })

  it('handles user creation error', async () => {
    vi.mocked(userApi.create).mockRejectedValue({
      response: { data: { error: 'Invalid name' } }
    })

    const store = useUserStore()
    
    await expect(store.createUser('Alice')).rejects.toThrow()
    expect(store.error).toBe('Invalid name')
    expect(store.currentUser).toBeNull()
  })

  it('creates household successfully', async () => {
    const mockUser = {
      id: 'user1',
      firstName: 'Alice',
      householdId: null,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    }

    const mockHousehold = {
      id: 'household1',
      name: "Alice's Household",
      inviteCode: 'ABC123',
      baseRate: 15.0,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      members: [{ ...mockUser, householdId: 'household1' }],
    }

    vi.mocked(householdApi.create).mockResolvedValue({
      data: { data: { household: mockHousehold } }
    } as any)

    const store = useUserStore()
    store.currentUser = mockUser

    const result = await store.createHousehold()

    expect(householdApi.create).toHaveBeenCalledWith('user1')
    expect(store.currentHousehold).toEqual(mockHousehold)
    expect(store.currentUser.householdId).toBe('household1')
    expect(result).toEqual(mockHousehold)
  })

  it('joins household successfully', async () => {
    const mockUser = {
      id: 'user2',
      firstName: 'Bob',
      householdId: null,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    }

    const mockHousehold = {
      id: 'household1',
      name: 'Alice-Bob',
      inviteCode: 'ABC123',
      baseRate: 15.0,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      members: [
        { id: 'user1', firstName: 'Alice', householdId: 'household1', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { ...mockUser, householdId: 'household1' }
      ],
    }

    vi.mocked(householdApi.join).mockResolvedValue({
      data: { data: { household: mockHousehold } }
    } as any)

    const store = useUserStore()
    store.currentUser = mockUser

    const result = await store.joinHousehold('ABC123')

    expect(householdApi.join).toHaveBeenCalledWith('user2', 'ABC123')
    expect(store.currentHousehold).toEqual(mockHousehold)
    expect(store.currentUser.householdId).toBe('household1')
    expect(result).toEqual(mockHousehold)
  })

  it('updates household settings successfully', async () => {
    const mockHousehold = {
      id: 'household1',
      name: 'Test Household',
      inviteCode: 'ABC123',
      baseRate: 20.0,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      members: [],
    }

    vi.mocked(householdApi.updateSettings).mockResolvedValue({
      data: { data: { household: mockHousehold } }
    } as any)

    const store = useUserStore()
    store.currentHousehold = { ...mockHousehold, baseRate: 15.0 }

    const result = await store.updateHouseholdSettings(20.0)

    expect(householdApi.updateSettings).toHaveBeenCalledWith('household1', 20.0)
    expect(store.currentHousehold.baseRate).toBe(20.0)
    expect(result).toEqual(mockHousehold)
  })

  it('logs out user successfully', () => {
    const store = useUserStore()
    store.currentUser = {
      id: 'user1',
      firstName: 'Alice',
      householdId: 'household1',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    }
    store.currentHousehold = {
      id: 'household1',
      name: 'Test Household',
      inviteCode: 'ABC123',
      baseRate: 15.0,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      members: [],
    }

    store.logout()

    expect(store.currentUser).toBeNull()
    expect(store.currentHousehold).toBeNull()
    expect(localStorage.removeItem).toHaveBeenCalledWith('userId')
  })

  it('initializes from storage when userId exists', async () => {
    const mockUser = {
      id: 'user1',
      firstName: 'Alice',
      householdId: 'household1',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    }

    const mockHousehold = {
      id: 'household1',
      name: 'Test Household',
      inviteCode: 'ABC123',
      baseRate: 15.0,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      members: [],
    }

    vi.mocked(localStorage.getItem).mockReturnValue('user1')
    vi.mocked(userApi.get).mockResolvedValue({
      data: { data: { user: mockUser } }
    } as any)
    vi.mocked(householdApi.get).mockResolvedValue({
      data: { data: { household: mockHousehold } }
    } as any)

    const store = useUserStore()
    store.initializeFromStorage()

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(localStorage.getItem).toHaveBeenCalledWith('userId')
    expect(userApi.get).toHaveBeenCalledWith('user1')
    expect(householdApi.get).toHaveBeenCalledWith('household1')
  })
})