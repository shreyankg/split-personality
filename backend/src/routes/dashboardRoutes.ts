import { Router } from 'express';
import { getDashboard, getEquityAnalysis } from '../controllers/dashboardController';

export const dashboardRoutes = Router();

dashboardRoutes.get('/:householdId', getDashboard);
dashboardRoutes.get('/:householdId/analysis', getEquityAnalysis);