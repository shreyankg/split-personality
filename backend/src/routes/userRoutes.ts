import { Router } from 'express';
import { createUser, getUser } from '../controllers/userController';

export const userRoutes = Router();

userRoutes.post('/', createUser);
userRoutes.get('/:id', getUser);