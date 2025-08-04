import { ChoreValuationService } from '../choreValuationService';
import { prisma } from '../../models';

// Define SkillLevel enum for testing
enum SkillLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

// Mock Prisma
jest.mock('../../models', () => ({
  prisma: {
    chore: {
      findUnique: jest.fn(),
    },
    completedChore: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ChoreValuationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateChoreValue', () => {
    it('should calculate basic chore value correctly', async () => {
      // Mock data
      mockedPrisma.chore.findUnique.mockResolvedValue({
        id: 'chore1',
        name: 'Test Chore',
        skillLevel: SkillLevel.BASIC,
        assignedTo: null,
        householdId: 'household1',
        createdAt: new Date(),
        updatedAt: new Date(),
        household: {
          id: 'household1',
          name: 'Test Household',
          inviteCode: 'TEST123',
          baseRate: 15.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      mockedPrisma.user.findMany.mockResolvedValue([
        { id: 'user1', firstName: 'Alice', householdId: 'household1', createdAt: new Date(), updatedAt: new Date() },
        { id: 'user2', firstName: 'Bob', householdId: 'household1', createdAt: new Date(), updatedAt: new Date() },
      ]);

      mockedPrisma.completedChore.findMany.mockResolvedValue([]);

      const value = await ChoreValuationService.calculateChoreValue('chore1', 'user1', 2.0);

      expect(value).toBe(30.0); // 15 * 2 = 30 (no bonuses for basic skill)
      expect(mockedPrisma.chore.findUnique).toHaveBeenCalledWith({
        where: { id: 'chore1' },
        include: { household: true },
      });
    });

    it('should apply intermediate skill bonus correctly', async () => {
      mockedPrisma.chore.findUnique.mockResolvedValue({
        id: 'chore1',
        name: 'Test Chore',
        skillLevel: SkillLevel.INTERMEDIATE,
        assignedTo: null,
        householdId: 'household1',
        createdAt: new Date(),
        updatedAt: new Date(),
        household: {
          id: 'household1',
          name: 'Test Household',
          inviteCode: 'TEST123',
          baseRate: 20.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      mockedPrisma.user.findMany.mockResolvedValue([
        { id: 'user1', firstName: 'Alice', householdId: 'household1', createdAt: new Date(), updatedAt: new Date() },
        { id: 'user2', firstName: 'Bob', householdId: 'household1', createdAt: new Date(), updatedAt: new Date() },
      ]);

      mockedPrisma.completedChore.findMany.mockResolvedValue([]);

      const value = await ChoreValuationService.calculateChoreValue('chore1', 'user1', 1.0);

      expect(value).toBe(28.0); // 20 * 1 * (1 + 0.15 skill + 0.25 rarity) = 28
    });

    it('should apply advanced skill bonus correctly', async () => {
      mockedPrisma.chore.findUnique.mockResolvedValue({
        id: 'chore1',
        name: 'Test Chore',
        skillLevel: SkillLevel.ADVANCED,
        assignedTo: null,
        householdId: 'household1',
        createdAt: new Date(),
        updatedAt: new Date(),
        household: {
          id: 'household1',
          name: 'Test Household',
          inviteCode: 'TEST123',
          baseRate: 20.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      mockedPrisma.user.findMany.mockResolvedValue([
        { id: 'user1', firstName: 'Alice', householdId: 'household1', createdAt: new Date(), updatedAt: new Date() },
        { id: 'user2', firstName: 'Bob', householdId: 'household1', createdAt: new Date(), updatedAt: new Date() },
      ]);

      mockedPrisma.completedChore.findMany.mockResolvedValue([]);

      const value = await ChoreValuationService.calculateChoreValue('chore1', 'user1', 1.0);

      expect(value).toBe(31.0); // 20 * 1 * (1 + 0.30 skill + 0.25 rarity) = 31
    });

    it('should apply rarity bonus when only one person can do advanced task', async () => {
      mockedPrisma.chore.findUnique.mockResolvedValue({
        id: 'chore1',
        name: 'Test Chore',
        skillLevel: SkillLevel.ADVANCED,
        assignedTo: null,
        householdId: 'household1',
        createdAt: new Date(),
        updatedAt: new Date(),
        household: {
          id: 'household1',
          name: 'Test Household',
          inviteCode: 'TEST123',
          baseRate: 20.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      mockedPrisma.user.findMany.mockResolvedValue([
        { id: 'user1', firstName: 'Alice', householdId: 'household1', createdAt: new Date(), updatedAt: new Date() },
        { id: 'user2', firstName: 'Bob', householdId: 'household1', createdAt: new Date(), updatedAt: new Date() },
      ]);

      // Mock that only user1 has completed this skill level before
      mockedPrisma.completedChore.findMany.mockResolvedValue([
        {
          id: 'completed1',
          choreId: 'chore1',
          completedBy: 'user1',
          timeSpent: 1.0,
          value: 20.0,
          completedAt: new Date(),
          householdId: 'household1',
        },
      ]);

      const value = await ChoreValuationService.calculateChoreValue('chore1', 'user1', 1.0);

      // Base: 20, Skill bonus: +6 (30%), Rarity bonus: +5 (25%) = 31
      expect(value).toBe(31.0);
    });

    it('should throw error when chore not found', async () => {
      mockedPrisma.chore.findUnique.mockResolvedValue(null);

      await expect(
        ChoreValuationService.calculateChoreValue('nonexistent', 'user1', 1.0)
      ).rejects.toThrow('Chore not found');
    });
  });
});