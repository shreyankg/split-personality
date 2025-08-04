export interface User {
  id: string;
  firstName: string;
  householdId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  baseRate: number;
  createdAt: string;
  updatedAt: string;
  members: User[];
}

export type SkillLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';

export interface Chore {
  id: string;
  name: string;
  skillLevel: SkillLevel;
  assignedTo?: string;
  householdId: string;
  createdAt: string;
  updatedAt: string;
  assignedUser?: User;
}

export interface CompletedChore {
  id: string;
  choreId: string;
  completedBy: string;
  timeSpent: number;
  value: number;
  completedAt: string;
  householdId: string;
  chore: Chore;
  completedByUser: User;
}

export interface Settlement {
  id: string;
  householdId: string;
  amount: number;
  fromUser: string;
  toUser: string;
  settledBy: string;
  note?: string;
  settledAt: string;
  fromUserName: string;
  toUserName: string;
}

export interface EquityBalance {
  userId: string;
  userName: string;
  totalValue: number;
  choreCount: number;
}

export interface EquityAnalysis {
  balances: EquityBalance[];
  netBalance: {
    owedBy: string;
    owedTo: string;
    amount: number;
  } | null;
  totalHouseholdValue: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface DashboardData {
  daily: EquityAnalysis;
  weekly: EquityAnalysis;
  monthly: EquityAnalysis;
  allTime: EquityAnalysis;
}