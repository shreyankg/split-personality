import { prisma } from '../models';

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
    startDate: Date;
    endDate: Date;
  };
}

export class EquityAnalysisService {
  public static async getEquityAnalysis(
    householdId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<EquityAnalysis> {
    const whereClause: any = {
      householdId,
    };

    if (startDate || endDate) {
      whereClause.completedAt = {};
      if (startDate) {
        whereClause.completedAt.gte = startDate;
      }
      if (endDate) {
        whereClause.completedAt.lte = endDate;
      }
    }

    const completedChores = await prisma.completedChore.findMany({
      where: whereClause,
      include: {
        completedByUser: true,
      },
    });

    const settlements = await prisma.settlement.findMany({
      where: {
        householdId,
        ...(startDate || endDate ? {
          settledAt: whereClause.completedAt,
        } : {}),
      },
    });

    const userBalances = new Map<string, EquityBalance>();

    completedChores.forEach((chore: any) => {
      const userId = chore.completedBy;
      const existing = userBalances.get(userId) || {
        userId,
        userName: chore.completedByUser.firstName,
        totalValue: 0,
        choreCount: 0,
      };

      existing.totalValue += chore.value;
      existing.choreCount += 1;

      userBalances.set(userId, existing);
    });

    const settledAmounts = new Map<string, number>();
    settlements.forEach((settlement: any) => {
      const fromUser = settlement.fromUser;
      const toUser = settlement.toUser;
      
      settledAmounts.set(fromUser, (settledAmounts.get(fromUser) || 0) - settlement.amount);
      settledAmounts.set(toUser, (settledAmounts.get(toUser) || 0) + settlement.amount);
    });

    const balances = Array.from(userBalances.values()).map(balance => ({
      ...balance,
      totalValue: balance.totalValue + (settledAmounts.get(balance.userId) || 0),
    }));

    const totalHouseholdValue = balances.reduce((sum, balance) => sum + Math.abs(balance.totalValue), 0);

    let netBalance = null;
    if (balances.length === 2) {
      const [user1, user2] = balances;
      const difference = user1.totalValue - user2.totalValue;
      
      if (Math.abs(difference) > 0.01) {
        if (difference > 0) {
          netBalance = {
            owedBy: user2.userId,
            owedTo: user1.userId,
            amount: Math.abs(difference / 2),
          };
        } else {
          netBalance = {
            owedBy: user1.userId,
            owedTo: user2.userId,
            amount: Math.abs(difference / 2),
          };
        }
      }
    }

    return {
      balances,
      netBalance,
      totalHouseholdValue: totalHouseholdValue / 2, // Actual value, not doubled
      period: {
        startDate: startDate || new Date(0),
        endDate: endDate || new Date(),
      },
    };
  }

  public static async getDashboardSummary(householdId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [dailyAnalysis, weeklyAnalysis, monthlyAnalysis, allTimeAnalysis] = await Promise.all([
      this.getEquityAnalysis(householdId, startOfDay),
      this.getEquityAnalysis(householdId, startOfWeek),
      this.getEquityAnalysis(householdId, startOfMonth),
      this.getEquityAnalysis(householdId),
    ]);

    return {
      daily: dailyAnalysis,
      weekly: weeklyAnalysis,
      monthly: monthlyAnalysis,
      allTime: allTimeAnalysis,
    };
  }
}