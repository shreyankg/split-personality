import { z } from 'zod';

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
});

export const joinHouseholdSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
});

export const createChoreSchema = z.object({
  name: z.string().min(1, 'Chore name is required').max(100, 'Chore name too long'),
  skillLevel: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED']).default('BASIC'),
  assignedTo: z.string().optional(),
});

export const completeChoreSchema = z.object({
  timeSpent: z.number().positive('Time spent must be positive').max(24, 'Time cannot exceed 24 hours'),
});

export const settleDebtSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  fromUser: z.string().min(1, 'From user is required'),
  toUser: z.string().min(1, 'To user is required'),
  note: z.string().optional(),
});

export const householdSettingsSchema = z.object({
  baseRate: z.number().positive('Base rate must be positive').max(100, 'Base rate too high'),
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type JoinHouseholdRequest = z.infer<typeof joinHouseholdSchema>;
export type CreateChoreRequest = z.infer<typeof createChoreSchema>;
export type CompleteChoreRequest = z.infer<typeof completeChoreSchema>;
export type SettleDebtRequest = z.infer<typeof settleDebtSchema>;
export type HouseholdSettingsRequest = z.infer<typeof householdSettingsSchema>;