import { Request, Response, NextFunction } from 'express';
import { prisma } from '../models';
import { createUserSchema } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName } = createUserSchema.parse(req.body);

    const user = await prisma.user.create({
      data: { firstName },
    });

    res.status(201).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        household: true,
      },
    });

    if (!user) {
      const error: AppError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};