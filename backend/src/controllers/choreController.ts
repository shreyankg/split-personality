import { Request, Response, NextFunction } from 'express';
import { prisma } from '../models';
import { createChoreSchema, completeChoreSchema } from '../utils/validation';
import { ChoreValuationService } from '../services/choreValuationService';
import { AppError } from '../middleware/errorHandler';

export const createChore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, skillLevel, assignedTo } = createChoreSchema.parse(req.body);
    const { householdId } = req.body;

    if (!householdId) {
      const error: AppError = new Error('Household ID is required');
      error.statusCode = 400;
      throw error;
    }

    const household = await prisma.household.findUnique({
      where: { id: householdId },
    });

    if (!household) {
      const error: AppError = new Error('Household not found');
      error.statusCode = 404;
      throw error;
    }

    if (assignedTo) {
      const user = await prisma.user.findFirst({
        where: { id: assignedTo, householdId },
      });

      if (!user) {
        const error: AppError = new Error('Assigned user not found in household');
        error.statusCode = 400;
        throw error;
      }
    }

    const chore = await prisma.chore.create({
      data: {
        name,
        skillLevel,
        assignedTo,
        householdId,
      },
      include: {
        assignedUser: true,
        household: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { chore },
    });
  } catch (error) {
    next(error);
  }
};

export const getChores = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { householdId } = req.query;

    if (!householdId) {
      const error: AppError = new Error('Household ID is required');
      error.statusCode = 400;
      throw error;
    }

    const chores = await prisma.chore.findMany({
      where: { householdId: householdId as string },
      include: {
        assignedUser: true,
        completedChores: {
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { chores },
    });
  } catch (error) {
    next(error);
  }
};

export const completeChore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { timeSpent } = completeChoreSchema.parse(req.body);
    const { completedBy } = req.body;

    if (!completedBy) {
      const error: AppError = new Error('Completed by user ID is required');
      error.statusCode = 400;
      throw error;
    }

    const chore = await prisma.chore.findUnique({
      where: { id },
      include: { household: true },
    });

    if (!chore) {
      const error: AppError = new Error('Chore not found');
      error.statusCode = 404;
      throw error;
    }

    const user = await prisma.user.findFirst({
      where: { id: completedBy, householdId: chore.householdId },
    });

    if (!user) {
      const error: AppError = new Error('User not found in household');
      error.statusCode = 400;
      throw error;
    }

    const choreValue = await ChoreValuationService.calculateChoreValue(
      id,
      completedBy,
      timeSpent
    );

    const completedChore = await prisma.completedChore.create({
      data: {
        choreId: id,
        completedBy,
        timeSpent,
        value: choreValue,
        householdId: chore.householdId,
      },
      include: {
        chore: true,
        completedByUser: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { completedChore },
    });
  } catch (error) {
    next(error);
  }
};

export const getCompletedChores = async (req: Request, res: Response, next: NextFunction) => {
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
      whereClause.completedAt = {};
      if (startDate) {
        whereClause.completedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.completedAt.lte = new Date(endDate as string);
      }
    }

    const completedChores = await prisma.completedChore.findMany({
      where: whereClause,
      include: {
        chore: true,
        completedByUser: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    res.json({
      success: true,
      data: { completedChores },
    });
  } catch (error) {
    next(error);
  }
};