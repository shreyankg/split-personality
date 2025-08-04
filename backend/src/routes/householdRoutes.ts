import { Router } from 'express';
import { createHousehold, joinHousehold, getHousehold, updateHouseholdSettings } from '../controllers/householdController';

export const householdRoutes = Router();

householdRoutes.post('/', createHousehold);
householdRoutes.post('/join', joinHousehold);
householdRoutes.get('/:id', getHousehold);
householdRoutes.patch('/:id/settings', updateHouseholdSettings);