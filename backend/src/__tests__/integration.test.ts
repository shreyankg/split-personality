import request from 'supertest';
import express from 'express';
import { userRoutes } from '../routes/userRoutes';
import { householdRoutes } from '../routes/householdRoutes';
import { choreRoutes } from '../routes/choreRoutes';
import { errorHandler } from '../middleware/errorHandler';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/chores', choreRoutes);
app.use(errorHandler);

// Mock Prisma for integration tests
jest.mock('../models', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    household: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    chore: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    completedChore: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '../models';
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Management Flow', () => {
    it('should create user and household successfully', async () => {
      const mockUser = {
        id: 'user1',
        firstName: 'Alice',
        householdId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockHousehold = {
        id: 'household1',
        name: "Alice's Household",
        inviteCode: 'ABC123',
        baseRate: 15.0,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [{ ...mockUser, householdId: 'household1' }],
      };

      // Step 1: Create user
      mockedPrisma.user.create.mockResolvedValue(mockUser);

      const createUserResponse = await request(app)
        .post('/api/users')
        .send({ firstName: 'Alice' })
        .expect(201);

      expect(createUserResponse.body).toMatchObject({
        success: true,
        data: { user: expect.objectContaining({ firstName: 'Alice' }) },
      });

      // Step 2: Create household
      mockedPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockedPrisma.household.create.mockResolvedValue({
        id: 'household1',
        name: "Alice's Household",
        inviteCode: 'ABC123',
        baseRate: 15.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockedPrisma.user.update.mockResolvedValue({ ...mockUser, householdId: 'household1' });
      mockedPrisma.household.findUnique.mockResolvedValue(mockHousehold);

      const createHouseholdResponse = await request(app)
        .post('/api/households')
        .send({ userId: 'user1' })
        .expect(201);

      expect(createHouseholdResponse.body).toMatchObject({
        success: true,
        data: { household: expect.objectContaining({ name: "Alice's Household" }) },
      });
    });
  });

  describe('Chore Management Flow', () => {
    it('should create and complete chore successfully', async () => {
      const mockChore = {
        id: 'chore1',
        name: 'Clean Kitchen',
        skillLevel: 'BASIC',
        assignedTo: null,
        householdId: 'household1',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedUser: null,
        household: {
          id: 'household1',
          name: 'Test Household',
          inviteCode: 'ABC123',
          baseRate: 15.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const mockCompletedChore = {
        id: 'completed1',
        choreId: 'chore1',
        completedBy: 'user1',
        timeSpent: 2.0,
        value: 30.0,
        completedAt: new Date(),
        householdId: 'household1',
        chore: mockChore,
        completedByUser: {
          id: 'user1',
          firstName: 'Alice',
          householdId: 'household1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      // Step 1: Create chore
      mockedPrisma.household.findUnique.mockResolvedValue({
        id: 'household1',
        name: 'Test Household',
        inviteCode: 'ABC123',
        baseRate: 15.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockedPrisma.chore.create.mockResolvedValue(mockChore);

      const createChoreResponse = await request(app)
        .post('/api/chores')
        .send({
          householdId: 'household1',
          name: 'Clean Kitchen',
          skillLevel: 'BASIC',
        })
        .expect(201);

      expect(createChoreResponse.body).toMatchObject({
        success: true,
        data: { chore: expect.objectContaining({ name: 'Clean Kitchen' }) },
      });

      // Step 2: Complete chore
      mockedPrisma.chore.findUnique.mockResolvedValue(mockChore);
      mockedPrisma.user.findFirst.mockResolvedValue({
        id: 'user1',
        firstName: 'Alice',
        householdId: 'household1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock valuation service dependencies
      mockedPrisma.user.findMany.mockResolvedValue([
        { id: 'user1', firstName: 'Alice', householdId: 'household1', createdAt: new Date(), updatedAt: new Date() },
        { id: 'user2', firstName: 'Bob', householdId: 'household1', createdAt: new Date(), updatedAt: new Date() },
      ]);
      mockedPrisma.completedChore.findMany.mockResolvedValue([]);
      mockedPrisma.completedChore.create.mockResolvedValue(mockCompletedChore);

      const completeChoreResponse = await request(app)
        .post('/api/chores/chore1/complete')
        .send({
          completedBy: 'user1',
          timeSpent: 2.0,
        })
        .expect(201);

      expect(completeChoreResponse.body).toMatchObject({
        success: true,
        data: {
          completedChore: expect.objectContaining({
            value: expect.any(Number),
            timeSpent: 2.0,
          }),
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors properly', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ firstName: '' })
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation error',
        details: expect.any(Array),
      });
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/chores')
        .send({
          householdId: 'household1',
          // missing name
        })
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation error',
      });
    });

    it('should handle not found errors', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/nonexistent')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'User not found',
      });
    });
  });
});