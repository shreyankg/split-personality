import { Router } from 'express';
import { settleDebt, getSettlements } from '../controllers/settlementController';

export const settlementRoutes = Router();

settlementRoutes.post('/', settleDebt);
settlementRoutes.get('/', getSettlements);