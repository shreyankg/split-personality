import { Request, Response, NextFunction } from 'express';
import { prisma } from '../models';
import { settleDebtSchema } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';

export const settleDebt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, fromUser, toUser, note } = settleDebtSchema.parse(req.body);
    const { householdId, settledBy } = req.body;

    if (!householdId || !settledBy) {
      const error: AppError = new Error('Household ID and settled by user ID are required');
      error.statusCode = 400;
      throw error;
    }

    const household = await prisma.household.findUnique({
      where: { id: householdId },
      include: { members: true },
    });

    if (!household) {
      const error: AppError = new Error('Household not found');
      error.statusCode = 404;
      throw error;
    }

    const memberIds = household.members.map(member => member.id);
    
    if (!memberIds.includes(fromUser) || !memberIds.includes(toUser) || !memberIds.includes(settledBy)) {
      const error: AppError = new Error('All users must be members of the household');
      error.statusCode = 400;
      throw error;
    }

    if (settledBy !== toUser) {
      const error: AppError = new Error('Only the user receiving payment can confirm settlement');
      error.statusCode = 403;
      throw error;
    }

    const settlement = await prisma.settlement.create({
      data: {
        householdId,
        amount,
        fromUser,
        toUser,
        settledBy,
        note,
      },
      include: {
        settledByUser: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { settlement },
    });
  } catch (error) {
    next(error);
  }
};

export const getSettlements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { householdId } = req.query;
    const { startDate, endDate } = req.query;

    if (!householdId) {
      const error: AppError = new Error('Household ID is required');
      error.statusCode = 400;
      throw error;
    }

    const whereClause: any = {
      householdId: householdId as string,
    };

    if (startDate || endDate) {
      whereClause.settledAt = {};
      if (startDate) {
        whereClause.settledAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.settledAt.lte = new Date(endDate as string);
      }
    }

    const settlements = await prisma.settlement.findMany({
      where: whereClause,
      include: {
        settledByUser: true,
        household: {
          include: {
            members: true,
          },
        },
      },
      orderBy: { settledAt: 'desc' },
    });

    const enrichedSettlements = settlements.map(settlement => {
      const fromUserName = settlement.household.members.find(m => m.id === settlement.fromUser)?.firstName || 'Unknown';
      const toUserName = settlement.household.members.find(m => m.id === settlement.toUser)?.firstName || 'Unknown';
      
      return {
        ...settlement,
        fromUserName,
        toUserName,
      };
    });

    res.json({
      success: true,
      data: { settlements: enrichedSettlements },
    });
  } catch (error) {
    next(error);
  }
};