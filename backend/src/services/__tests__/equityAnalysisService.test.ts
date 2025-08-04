import { EquityAnalysisService } from '../equityAnalysisService';
import { prisma } from '../../models';

// Mock Prisma
jest.mock('../../models', () => ({
  prisma: {
    completedChore: {
      findMany: jest.fn(),
    },
    settlement: {
      findMany: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('EquityAnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEquityAnalysis', () => {
    it('should calculate equity analysis correctly', async () => {
      const mockCompletedChores = [
        {
          id: 'completed1',
          choreId: 'chore1',
          completedBy: 'user1',
          timeSpent: 2.0,
          value: 30.0,
          completedAt: new Date('2023-01-01'),
          householdId: 'household1',
          completedByUser: { firstName: 'Alice' },
        },
        {
          id: 'completed2',
          choreId: 'chore2',
          completedBy: 'user2',
          timeSpent: 1.5,
          value: 22.5,
          completedAt: new Date('2023-01-02'),
          householdId: 'household1',
          completedByUser: { firstName: 'Bob' },
        },
        {
          id: 'completed3',
          choreId: 'chore3',
          completedBy: 'user1',
          timeSpent: 1.0,
          value: 15.0,
          completedAt: new Date('2023-01-03'),
          householdId: 'household1',
          completedByUser: { firstName: 'Alice' },
        },
      ];

      mockedPrisma.completedChore.findMany.mockResolvedValue(mockCompletedChores as any);
      mockedPrisma.settlement.findMany.mockResolvedValue([]);

      const analysis = await EquityAnalysisService.getEquityAnalysis('household1');

      expect(analysis.balances).toHaveLength(2);
      
      const aliceBalance = analysis.balances.find(b => b.userName === 'Alice');
      const bobBalance = analysis.balances.find(b => b.userName === 'Bob');

      expect(aliceBalance).toBeDefined();
      expect(aliceBalance!.totalValue).toBe(45.0); // 30 + 15
      expect(aliceBalance!.choreCount).toBe(2);

      expect(bobBalance).toBeDefined();
      expect(bobBalance!.totalValue).toBe(22.5);
      expect(bobBalance!.choreCount).toBe(1);

      expect(analysis.totalHouseholdValue).toBe(33.75); // (45 + 22.5) / 2
      expect(analysis.netBalance).toBeDefined();
      expect(analysis.netBalance!.amount).toBeCloseTo(11.25); // (45 - 22.5) / 2
    });

    it('should account for settlements in balance calculation', async () => {
      const mockCompletedChores = [
        {
          id: 'completed1',
          choreId: 'chore1',
          completedBy: 'user1',
          timeSpent: 2.0,
          value: 40.0,
          completedAt: new Date('2023-01-01'),
          householdId: 'household1',
          completedByUser: { firstName: 'Alice' },
        },
        {
          id: 'completed2',
          choreId: 'chore2',
          completedBy: 'user2',
          timeSpent: 1.0,
          value: 20.0,
          completedAt: new Date('2023-01-02'),
          householdId: 'household1',
          completedByUser: { firstName: 'Bob' },
        },
      ];

      const mockSettlements = [
        {
          id: 'settlement1',
          householdId: 'household1',
          amount: 10.0,
          fromUser: 'user2',
          toUser: 'user1',
          settledBy: 'user1',
          note: 'Test settlement',
          settledAt: new Date('2023-01-03'),
        },
      ];

      mockedPrisma.completedChore.findMany.mockResolvedValue(mockCompletedChores as any);
      mockedPrisma.settlement.findMany.mockResolvedValue(mockSettlements as any);

      const analysis = await EquityAnalysisService.getEquityAnalysis('household1');

      const aliceBalance = analysis.balances.find(b => b.userName === 'Alice');
      const bobBalance = analysis.balances.find(b => b.userName === 'Bob');

      // Alice: 40 (chores) + 10 (settlement received) = 50
      expect(aliceBalance!.totalValue).toBe(50.0);
      
      // Bob: 20 (chores) - 10 (settlement paid) = 10
      expect(bobBalance!.totalValue).toBe(10.0);

      // Net balance: (50 - 10) / 2 = 20, so Bob owes Alice 20
      expect(analysis.netBalance!.amount).toBe(20.0);
      expect(analysis.netBalance!.owedBy).toBe('user2');
      expect(analysis.netBalance!.owedTo).toBe('user1');
    });

    it('should return null net balance when amounts are equal', async () => {
      const mockCompletedChores = [
        {
          id: 'completed1',
          choreId: 'chore1',
          completedBy: 'user1',
          timeSpent: 1.0,
          value: 20.0,
          completedAt: new Date('2023-01-01'),
          householdId: 'household1',
          completedByUser: { firstName: 'Alice' },
        },
        {
          id: 'completed2',
          choreId: 'chore2',
          completedBy: 'user2',
          timeSpent: 1.0,
          value: 20.0,
          completedAt: new Date('2023-01-02'),
          householdId: 'household1',
          completedByUser: { firstName: 'Bob' },
        },
      ];

      mockedPrisma.completedChore.findMany.mockResolvedValue(mockCompletedChores as any);
      mockedPrisma.settlement.findMany.mockResolvedValue([]);

      const analysis = await EquityAnalysisService.getEquityAnalysis('household1');

      expect(analysis.netBalance).toBeNull();
    });

    it('should filter by date range when provided', async () => {
      const startDate = new Date('2023-01-02');
      const endDate = new Date('2023-01-03');

      mockedPrisma.completedChore.findMany.mockResolvedValue([]);
      mockedPrisma.settlement.findMany.mockResolvedValue([]);

      await EquityAnalysisService.getEquityAnalysis('household1', startDate, endDate);

      expect(mockedPrisma.completedChore.findMany).toHaveBeenCalledWith({
        where: {
          householdId: 'household1',
          completedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          completedByUser: true,
        },
      });
    });
  });

  describe('getDashboardSummary', () => {
    it('should return all time periods', async () => {
      mockedPrisma.completedChore.findMany.mockResolvedValue([]);
      mockedPrisma.settlement.findMany.mockResolvedValue([]);

      const summary = await EquityAnalysisService.getDashboardSummary('household1');

      expect(summary).toHaveProperty('daily');
      expect(summary).toHaveProperty('weekly');
      expect(summary).toHaveProperty('monthly');
      expect(summary).toHaveProperty('allTime');

      // Should have called getEquityAnalysis 4 times
      expect(mockedPrisma.completedChore.findMany).toHaveBeenCalledTimes(4);
    });
  });
});