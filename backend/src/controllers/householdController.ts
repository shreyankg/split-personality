import { Request, Response, NextFunction } from 'express';
import { prisma } from '../models';
import { joinHouseholdSchema, householdSettingsSchema } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';

export const createHousehold = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      const error: AppError = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error: AppError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.householdId) {
      const error: AppError = new Error('User already belongs to a household');
      error.statusCode = 400;
      throw error;
    }

    const household = await prisma.household.create({
      data: {
        name: `${user.firstName}'s Household`,
        // Let Prisma generate the invite code using cuid() default
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { householdId: household.id },
    });

    const updatedHousehold = await prisma.household.findUnique({
      where: { id: household.id },
      include: { members: true },
    });

    res.status(201).json({
      success: true,
      data: { household: updatedHousehold },
    });
  } catch (error) {
    next(error);
  }
};

export const joinHousehold = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { inviteCode } = joinHouseholdSchema.parse(req.body);
    const { userId } = req.body;

    if (!userId) {
      const error: AppError = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error: AppError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.householdId) {
      const error: AppError = new Error('User already belongs to a household');
      error.statusCode = 400;
      throw error;
    }

    const household = await prisma.household.findUnique({
      where: { inviteCode },
      include: { members: true },
    });

    if (!household) {
      const error: AppError = new Error('Invalid invite code');
      error.statusCode = 404;
      throw error;
    }

    if (household.members.length >= 2) {
      const error: AppError = new Error('Household is full (V1 supports only 2 members)');
      error.statusCode = 400;
      throw error;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { householdId: household.id },
    });

    const updatedHousehold = await prisma.household.findUnique({
      where: { id: household.id },
      include: { members: true },
    });

    if (updatedHousehold && updatedHousehold.members.length === 2) {
      const member1 = updatedHousehold.members[0];
      const member2 = updatedHousehold.members[1];
      const householdName = `${member1.firstName}-${member2.firstName}`;

      await prisma.household.update({
        where: { id: household.id },
        data: { name: householdName },
      });

      updatedHousehold.name = householdName;
    }

    res.json({
      success: true,
      data: { household: updatedHousehold },
    });
  } catch (error) {
    next(error);
  }
};

export const getHousehold = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const household = await prisma.household.findUnique({
      where: { id },
      include: {
        members: true,
        chores: true,
      },
    });

    if (!household) {
      const error: AppError = new Error('Household not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: { household },
    });
  } catch (error) {
    next(error);
  }
};

export const updateHouseholdSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { baseRate } = householdSettingsSchema.parse(req.body);

    const household = await prisma.household.update({
      where: { id },
      data: { baseRate },
      include: { members: true },
    });

    res.json({
      success: true,
      data: { household },
    });
  } catch (error) {
    next(error);
  }
};