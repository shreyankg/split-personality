import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock axios before any imports
vi.mock('axios', () => {
  const mockPost = vi.fn()
  const mockGet = vi.fn()
  const mockPatch = vi.fn()
  const mockDelete = vi.fn()
  
  return {
    default: {
      create: vi.fn(() => ({
        post: mockPost,
        get: mockGet,
        patch: mockPatch,
        delete: mockDelete
      }))
    }
  }
})

// Import after mocking
import axios from 'axios'
import { userApi, householdApi, choreApi, dashboardApi, settlementApi } from '@/services/api'

// Get the mock functions from the axios instance
const mockAxiosInstance = (axios.create as any)()
const { post: mockPost, get: mockGet, patch: mockPatch, delete: mockDelete } = mockAxiosInstance

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
      mockPost.mockResolvedValue(mockResponse)

      const result = await userApi.create('Alice')

      expect(mockPost).toHaveBeenCalledWith('/users', { firstName: 'Alice' })
      expect(result).toEqual(mockResponse)
    })

    it('gets user correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { user: { id: 'user1', firstName: 'Alice' } }
        }
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await userApi.get('user1')

      expect(mockGet).toHaveBeenCalledWith('/users/user1')
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
      mockPost.mockResolvedValue(mockResponse)

      const result = await householdApi.create('user1')

      expect(mockPost).toHaveBeenCalledWith('/households', { userId: 'user1' })
      expect(result).toEqual(mockResponse)
    })

    it('joins household correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { household: { id: 'household1', name: 'Test Household' } }
        }
      }
      mockPost.mockResolvedValue(mockResponse)

      const result = await householdApi.join('user1', 'ABC123')

      expect(mockPost).toHaveBeenCalledWith('/households/join', { userId: 'user1', inviteCode: 'ABC123' })
      expect(result).toEqual(mockResponse)
    })

    it('updates settings correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { household: { id: 'household1', baseRate: 20.0 } }
        }
      }
      mockPatch.mockResolvedValue(mockResponse)

      const result = await householdApi.updateSettings('household1', 20.0)

      expect(mockPatch).toHaveBeenCalledWith('/households/household1/settings', { baseRate: 20.0 })
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
      mockPost.mockResolvedValue(mockResponse)

      const result = await choreApi.create('household1', 'Clean Kitchen', 'BASIC', 'user1')

      expect(mockPost).toHaveBeenCalledWith('/chores', {
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
      mockGet.mockResolvedValue(mockResponse)

      const result = await choreApi.getAll('household1')

      expect(mockGet).toHaveBeenCalledWith('/chores', {
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
      mockPost.mockResolvedValue(mockResponse)

      const result = await choreApi.complete('chore1', 'user1', 2.0)

      expect(mockPost).toHaveBeenCalledWith('/chores/chore1/complete', {
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
      mockGet.mockResolvedValue(mockResponse)

      const result = await dashboardApi.get('household1')

      expect(mockGet).toHaveBeenCalledWith('/dashboard/household1')
      expect(result).toEqual(mockResponse)
    })

    it('gets analysis with date filters correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { totalHouseholdValue: 250 }
        }
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await dashboardApi.getAnalysis('household1', '2023-01-01', '2023-01-31')

      expect(mockGet).toHaveBeenCalledWith('/dashboard/household1/analysis', {
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
      mockPost.mockResolvedValue(mockResponse)

      const result = await settlementApi.create('household1', 'user1', 25.0, 'user2', 'user1', 'Paid via Venmo')

      expect(mockPost).toHaveBeenCalledWith('/settlements', {
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
      mockGet.mockResolvedValue(mockResponse)

      const result = await settlementApi.getAll('household1', '2023-01-01', '2023-01-31')

      expect(mockGet).toHaveBeenCalledWith('/settlements', {
        params: { householdId: 'household1', startDate: '2023-01-01', endDate: '2023-01-31' }
      })
      expect(result).toEqual(mockResponse)
    })
  })
})