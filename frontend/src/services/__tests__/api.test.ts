import { describe, it, expect, beforeEach, vi } from 'vitest'

// Create a mock axios instance
const mockAxiosInstance = {
  post: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}

// Mock axios before importing the API service
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance)
  }
}))

// Import after mocking
import { userApi, householdApi, choreApi, dashboardApi, settlementApi } from '@/services/api'

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('userApi', () => {
    it('creates user correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { user: { id: 'user1', firstName: 'Alice' } }
        }
      }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await userApi.create('Alice')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', { firstName: 'Alice' })
      expect(result).toEqual(mockResponse)
    })

    it('gets user correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { user: { id: 'user1', firstName: 'Alice' } }
        }
      }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await userApi.get('user1')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/user1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('householdApi', () => {
    it('creates household correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { household: { id: 'household1', name: 'Test Household' } }
        }
      }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await householdApi.create('user1')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/households', { userId: 'user1' })
      expect(result).toEqual(mockResponse)
    })

    it('joins household correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { household: { id: 'household1', name: 'Test Household' } }
        }
      }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await householdApi.join('user1', 'ABC123')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/households/join', { userId: 'user1', inviteCode: 'ABC123' })
      expect(result).toEqual(mockResponse)
    })

    it('updates settings correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { household: { id: 'household1', baseRate: 20.0 } }
        }
      }
      mockAxiosInstance.patch.mockResolvedValue(mockResponse)

      const result = await householdApi.updateSettings('household1', 20.0)

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/households/household1/settings', { baseRate: 20.0 })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('choreApi', () => {
    it('creates chore correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { chore: { id: 'chore1', name: 'Clean Kitchen' } }
        }
      }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await choreApi.create('household1', 'Clean Kitchen', 'BASIC', 'user1')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/chores', {
        householdId: 'household1',
        name: 'Clean Kitchen',
        skillLevel: 'BASIC',
        assignedTo: 'user1'
      })
      expect(result).toEqual(mockResponse)
    })

    it('gets all chores correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { chores: [{ id: 'chore1', name: 'Clean Kitchen' }] }
        }
      }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await choreApi.getAll('household1')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chores', {
        params: { householdId: 'household1' }
      })
      expect(result).toEqual(mockResponse)
    })

    it('completes chore correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { completedChore: { id: 'completed1', value: 30.0 } }
        }
      }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await choreApi.complete('chore1', 'user1', 2.0)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/chores/chore1/complete', {
        completedBy: 'user1',
        timeSpent: 2.0
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('dashboardApi', () => {
    it('gets dashboard data correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            daily: { totalHouseholdValue: 100 },
            weekly: { totalHouseholdValue: 500 }
          }
        }
      }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardApi.get('household1')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dashboard/household1')
      expect(result).toEqual(mockResponse)
    })

    it('gets analysis with date filters correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { totalHouseholdValue: 250 }
        }
      }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardApi.getAnalysis('household1', '2023-01-01', '2023-01-31')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dashboard/household1/analysis', {
        params: { startDate: '2023-01-01', endDate: '2023-01-31' }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('settlementApi', () => {
    it('creates settlement correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { settlement: { id: 'settlement1', amount: 25.0 } }
        }
      }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await settlementApi.create('household1', 'user1', 25.0, 'user2', 'user1', 'Paid via Venmo')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/settlements', {
        householdId: 'household1',
        settledBy: 'user1',
        amount: 25.0,
        fromUser: 'user2',
        toUser: 'user1',
        note: 'Paid via Venmo'
      })
      expect(result).toEqual(mockResponse)
    })

    it('gets all settlements correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { settlements: [{ id: 'settlement1', amount: 25.0 }] }
        }
      }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await settlementApi.getAll('household1', '2023-01-01', '2023-01-31')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/settlements', {
        params: { householdId: 'household1', startDate: '2023-01-01', endDate: '2023-01-31' }
      })
      expect(result).toEqual(mockResponse)
    })
  })
})