import { Router } from 'express';
import { createChore, getChores, completeChore, getCompletedChores } from '../controllers/choreController';

export const choreRoutes = Router();

choreRoutes.post('/', createChore);
choreRoutes.get('/', getChores);
choreRoutes.post('/:id/complete', completeChore);
choreRoutes.get('/completed', getCompletedChores);