import { Request, Response, NextFunction } from 'express';
import { EquityAnalysisService } from '../services/equityAnalysisService';
import { AppError } from '../middleware/errorHandler';

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { householdId } = req.params;

    if (!householdId) {
      const error: AppError = new Error('Household ID is required');
      error.statusCode = 400;
      throw error;
    }

    const dashboardData = await EquityAnalysisService.getDashboardSummary(householdId);

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
};

export const getEquityAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { householdId } = req.params;
    const { startDate, endDate } = req.query;

    if (!householdId) {
      const error: AppError = new Error('Household ID is required');
      error.statusCode = 400;
      throw error;
    }

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const analysis = await EquityAnalysisService.getEquityAnalysis(householdId, start, end);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};