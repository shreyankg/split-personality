import axios from 'axios';
import type { User, Household, Chore, CompletedChore, Settlement, DashboardData, EquityAnalysis } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userApi = {
  create: (firstName: string) => 
    api.post<{ success: boolean; data: { user: User } }>('/users', { firstName }),
  
  get: (id: string) => 
    api.get<{ success: boolean; data: { user: User } }>(`/users/${id}`),
};

export const householdApi = {
  create: (userId: string) => 
    api.post<{ success: boolean; data: { household: Household } }>('/households', { userId }),
  
  join: (userId: string, inviteCode: string) => 
    api.post<{ success: boolean; data: { household: Household } }>('/households/join', { userId, inviteCode }),
  
  get: (id: string) => 
    api.get<{ success: boolean; data: { household: Household } }>(`/households/${id}`),
  
  updateSettings: (id: string, baseRate: number) => 
    api.patch<{ success: boolean; data: { household: Household } }>(`/households/${id}/settings`, { baseRate }),
};

export const choreApi = {
  create: (householdId: string, name: string, skillLevel: string, assignedTo?: string) => 
    api.post<{ success: boolean; data: { chore: Chore } }>('/chores', { 
      householdId, name, skillLevel, assignedTo 
    }),
  
  getAll: (householdId: string) => 
    api.get<{ success: boolean; data: { chores: (Chore & { completedChores: CompletedChore[] })[] } }>('/chores', { 
      params: { householdId } 
    }),
  
  complete: (id: string, completedBy: string, timeSpent: number) => 
    api.post<{ success: boolean; data: { completedChore: CompletedChore } }>(`/chores/${id}/complete`, { 
      completedBy, timeSpent 
    }),
  
  getCompleted: (householdId: string, startDate?: string, endDate?: string) => 
    api.get<{ success: boolean; data: { completedChores: CompletedChore[] } }>('/chores/completed', { 
      params: { householdId, startDate, endDate } 
    }),
};

export const dashboardApi = {
  get: (householdId: string) => 
    api.get<{ success: boolean; data: DashboardData }>(`/dashboard/${householdId}`),
  
  getAnalysis: (householdId: string, startDate?: string, endDate?: string) => 
    api.get<{ success: boolean; data: EquityAnalysis }>(`/dashboard/${householdId}/analysis`, { 
      params: { startDate, endDate } 
    }),
};

export const settlementApi = {
  create: (householdId: string, settledBy: string, amount: number, fromUser: string, toUser: string, note?: string) => 
    api.post<{ success: boolean; data: { settlement: Settlement } }>('/settlements', { 
      householdId, settledBy, amount, fromUser, toUser, note 
    }),
  
  getAll: (householdId: string, startDate?: string, endDate?: string) => 
    api.get<{ success: boolean; data: { settlements: Settlement[] } }>('/settlements', { 
      params: { householdId, startDate, endDate } 
    }),
};