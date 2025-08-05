import { Request, Response, NextFunction } from 'express';
import { createChore, getChores, completeChore, getCompletedChores, deleteChore } from '../choreController';

// Mock Prisma
jest.mock('../../models', () => ({
  prisma: {
    household: {
      findUnique: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    chore: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    completedChore: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

// Mock ChoreValuationService
jest.mock('../../services/choreValuationService', () => ({
  ChoreValuationService: {
    calculateChoreValue: jest.fn(),
  },
}));

import { prisma } from '../../models';
import { ChoreValuationService } from '../../services/choreValuationService';

const mockPrisma = prisma as any;
const mockChoreValuationService = ChoreValuationService as any;

describe('ChoreController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('createChore', () => {
    const mockHousehold = {
      id: 'household1',
      name: 'Test Household',
      inviteCode: 'ABC123',
      baseRate: 15.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser = {
      id: 'user1',
      firstName: 'Alice',
      householdId: 'household1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockChore = {
      id: 'chore1',
      name: 'Clean Kitchen',
      skillLevel: 'BASIC',
      assignedTo: null,
      householdId: 'household1',
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedUser: null,
      household: mockHousehold,
    };

    it('should create a chore successfully', async () => {
      mockRequest.body = {
        name: 'Clean Kitchen',
        skillLevel: 'BASIC',
        householdId: 'household1',
      };

      mockPrisma.household.findUnique.mockResolvedValue(mockHousehold);
      mockPrisma.chore.create.mockResolvedValue(mockChore);

      await createChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.household.findUnique).toHaveBeenCalledWith({
        where: { id: 'household1' },
      });
      expect(mockPrisma.chore.create).toHaveBeenCalledWith({
        data: {
          name: 'Clean Kitchen',
          skillLevel: 'BASIC',
          assignedTo: undefined,
          householdId: 'household1',
        },
        include: {
          assignedUser: true,
          household: true,
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { chore: mockChore },
      });
    });

    it('should create a chore with assigned user successfully', async () => {
      mockRequest.body = {
        name: 'Clean Kitchen',
        skillLevel: 'INTERMEDIATE',
        assignedTo: 'user1',
        householdId: 'household1',
      };

      const mockChoreWithAssignment = {
        ...mockChore,
        assignedTo: 'user1',
        assignedUser: mockUser,
      };

      mockPrisma.household.findUnique.mockResolvedValue(mockHousehold);
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.chore.create.mockResolvedValue(mockChoreWithAssignment);

      await createChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user1', householdId: 'household1' },
      });
      expect(mockPrisma.chore.create).toHaveBeenCalledWith({
        data: {
          name: 'Clean Kitchen',
          skillLevel: 'INTERMEDIATE',
          assignedTo: 'user1',
          householdId: 'household1',
        },
        include: {
          assignedUser: true,
          household: true,
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 if householdId is missing', async () => {
      mockRequest.body = {
        name: 'Clean Kitchen',
        skillLevel: 'BASIC',
      };

      await createChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Household ID is required',
          statusCode: 400,
        })
      );
    });

    it('should return 404 if household not found', async () => {
      mockRequest.body = {
        name: 'Clean Kitchen',
        skillLevel: 'BASIC',
        householdId: 'nonexistent',
      };

      mockPrisma.household.findUnique.mockResolvedValue(null);

      await createChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Household not found',
          statusCode: 404,
        })
      );
    });

    it('should return 400 if assigned user not found in household', async () => {
      mockRequest.body = {
        name: 'Clean Kitchen',
        skillLevel: 'BASIC',
        assignedTo: 'nonexistent',
        householdId: 'household1',
      };

      mockPrisma.household.findUnique.mockResolvedValue(mockHousehold);
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await createChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Assigned user not found in household',
          statusCode: 400,
        })
      );
    });

    it('should handle validation errors', async () => {
      mockRequest.body = {
        name: '', // Invalid empty name
        skillLevel: 'INVALID_SKILL',
        householdId: 'household1',
      };

      await createChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      // The validation error will be thrown by Zod schema parsing
    });
  });

  describe('getChores', () => {
    const mockChores = [
      {
        id: 'chore1',
        name: 'Clean Kitchen',
        skillLevel: 'BASIC',
        assignedTo: null,
        householdId: 'household1',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedUser: null,
        completedChores: [],
      },
      {
        id: 'chore2',
        name: 'Vacuum Living Room',
        skillLevel: 'INTERMEDIATE',
        assignedTo: 'user1',
        householdId: 'household1',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedUser: {
          id: 'user1',
          firstName: 'Alice',
          householdId: 'household1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        completedChores: [
          {
            id: 'completed1',
            completedAt: new Date(),
            value: 22.5,
          },
        ],
      },
    ];

    it('should get chores for a household successfully', async () => {
      mockRequest.query = { householdId: 'household1' };

      mockPrisma.chore.findMany.mockResolvedValue(mockChores);

      await getChores(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.chore.findMany).toHaveBeenCalledWith({
        where: { householdId: 'household1' },
        include: {
          assignedUser: true,
          completedChores: {
            orderBy: { completedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { chores: mockChores },
      });
    });

    it('should return 400 if householdId is missing', async () => {
      mockRequest.query = {};

      await getChores(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Household ID is required',
          statusCode: 400,
        })
      );
    });

    it('should return empty array if no chores exist', async () => {
      mockRequest.query = { householdId: 'household1' };

      mockPrisma.chore.findMany.mockResolvedValue([]);

      await getChores(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { chores: [] },
      });
    });
  });

  describe('completeChore', () => {
    const mockChore = {
      id: 'chore1',
      name: 'Clean Kitchen',
      skillLevel: 'BASIC',
      assignedTo: null,
      householdId: 'household1',
      createdAt: new Date(),
      updatedAt: new Date(),
      household: {
        id: 'household1',
        name: 'Test Household',
        inviteCode: 'ABC123',
        baseRate: 15.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const mockUser = {
      id: 'user1',
      firstName: 'Alice',
      householdId: 'household1',
      createdAt: new Date(),
      updatedAt: new Date(),
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
      completedByUser: mockUser,
    };

    it('should complete a chore successfully', async () => {
      mockRequest.params = { id: 'chore1' };
      mockRequest.body = {
        completedBy: 'user1',
        timeSpent: 2.0,
      };

      mockPrisma.chore.findUnique.mockResolvedValue(mockChore);
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockChoreValuationService.calculateChoreValue.mockResolvedValue(30.0);
      mockPrisma.completedChore.create.mockResolvedValue(mockCompletedChore);

      await completeChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.chore.findUnique).toHaveBeenCalledWith({
        where: { id: 'chore1' },
        include: { household: true },
      });
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user1', householdId: 'household1' },
      });
      expect(mockChoreValuationService.calculateChoreValue).toHaveBeenCalledWith(
        'chore1',
        'user1',
        2.0
      );
      expect(mockPrisma.completedChore.create).toHaveBeenCalledWith({
        data: {
          choreId: 'chore1',
          completedBy: 'user1',
          timeSpent: 2.0,
          value: 30.0,
          householdId: 'household1',
        },
        include: {
          chore: true,
          completedByUser: true,
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { completedChore: mockCompletedChore },
      });
    });

    it('should return 400 if completedBy is missing', async () => {
      mockRequest.params = { id: 'chore1' };
      mockRequest.body = {
        timeSpent: 2.0,
      };

      await completeChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Completed by user ID is required',
          statusCode: 400,
        })
      );
    });

    it('should return 404 if chore not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = {
        completedBy: 'user1',
        timeSpent: 2.0,
      };

      mockPrisma.chore.findUnique.mockResolvedValue(null);

      await completeChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Chore not found',
          statusCode: 404,
        })
      );
    });

    it('should return 400 if user not found in household', async () => {
      mockRequest.params = { id: 'chore1' };
      mockRequest.body = {
        completedBy: 'nonexistent',
        timeSpent: 2.0,
      };

      mockPrisma.chore.findUnique.mockResolvedValue(mockChore);
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await completeChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found in household',
          statusCode: 400,
        })
      );
    });

    it('should handle validation errors for invalid timeSpent', async () => {
      mockRequest.params = { id: 'chore1' };
      mockRequest.body = {
        completedBy: 'user1',
        timeSpent: -1, // Invalid negative time
      };

      await completeChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      // The validation error will be thrown by Zod schema parsing
    });

    it('should handle ChoreValuationService errors', async () => {
      mockRequest.params = { id: 'chore1' };
      mockRequest.body = {
        completedBy: 'user1',
        timeSpent: 2.0,
      };

      mockPrisma.chore.findUnique.mockResolvedValue(mockChore);
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockChoreValuationService.calculateChoreValue.mockRejectedValue(
        new Error('Valuation service error')
      );

      await completeChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Valuation service error',
        })
      );
    });
  });

  describe('getCompletedChores', () => {
    const mockCompletedChores = [
      {
        id: 'completed1',
        choreId: 'chore1',
        completedBy: 'user1',
        timeSpent: 2.0,
        value: 30.0,
        completedAt: new Date('2023-12-01'),
        householdId: 'household1',
        chore: {
          id: 'chore1',
          name: 'Clean Kitchen',
          skillLevel: 'BASIC',
        },
        completedByUser: {
          id: 'user1',
          firstName: 'Alice',
        },
      },
      {
        id: 'completed2',
        choreId: 'chore2',
        completedBy: 'user2',
        timeSpent: 1.5,
        value: 22.5,
        completedAt: new Date('2023-11-30'),
        householdId: 'household1',
        chore: {
          id: 'chore2',
          name: 'Vacuum Living Room',
          skillLevel: 'INTERMEDIATE',
        },
        completedByUser: {
          id: 'user2',
          firstName: 'Bob',
        },
      },
    ];

    it('should get completed chores for a household successfully', async () => {
      mockRequest.query = { householdId: 'household1' };

      mockPrisma.completedChore.findMany.mockResolvedValue(mockCompletedChores);

      await getCompletedChores(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.completedChore.findMany).toHaveBeenCalledWith({
        where: { householdId: 'household1' },
        include: {
          chore: true,
          completedByUser: true,
        },
        orderBy: { completedAt: 'desc' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { completedChores: mockCompletedChores },
      });
    });

    it('should filter completed chores by date range', async () => {
      mockRequest.query = {
        householdId: 'household1',
        startDate: '2023-12-01',
        endDate: '2023-12-31',
      };

      mockPrisma.completedChore.findMany.mockResolvedValue([mockCompletedChores[0]]);

      await getCompletedChores(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.completedChore.findMany).toHaveBeenCalledWith({
        where: {
          householdId: 'household1',
          completedAt: {
            gte: new Date('2023-12-01'),
            lte: new Date('2023-12-31'),
          },
        },
        include: {
          chore: true,
          completedByUser: true,
        },
        orderBy: { completedAt: 'desc' },
      });
    });

    it('should filter completed chores by start date only', async () => {
      mockRequest.query = {
        householdId: 'household1',
        startDate: '2023-12-01',
      };

      mockPrisma.completedChore.findMany.mockResolvedValue([mockCompletedChores[0]]);

      await getCompletedChores(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.completedChore.findMany).toHaveBeenCalledWith({
        where: {
          householdId: 'household1',
          completedAt: {
            gte: new Date('2023-12-01'),
          },
        },
        include: {
          chore: true,
          completedByUser: true,
        },
        orderBy: { completedAt: 'desc' },
      });
    });

    it('should filter completed chores by end date only', async () => {
      mockRequest.query = {
        householdId: 'household1',
        endDate: '2023-12-31',
      };

      mockPrisma.completedChore.findMany.mockResolvedValue(mockCompletedChores);

      await getCompletedChores(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.completedChore.findMany).toHaveBeenCalledWith({
        where: {
          householdId: 'household1',
          completedAt: {
            lte: new Date('2023-12-31'),
          },
        },
        include: {
          chore: true,
          completedByUser: true,
        },
        orderBy: { completedAt: 'desc' },
      });
    });

    it('should return 400 if householdId is missing', async () => {
      mockRequest.query = {};

      await getCompletedChores(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Household ID is required',
          statusCode: 400,
        })
      );
    });

    it('should return empty array if no completed chores exist', async () => {
      mockRequest.query = { householdId: 'household1' };

      mockPrisma.completedChore.findMany.mockResolvedValue([]);

      await getCompletedChores(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { completedChores: [] },
      });
    });

    it('should handle database errors', async () => {
      mockRequest.query = { householdId: 'household1' };

      mockPrisma.completedChore.findMany.mockRejectedValue(new Error('Database error'));

      await getCompletedChores(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Database error',
        })
      );
    });
  });

  describe('deleteChore', () => {
    const mockChore = {
      id: 'chore1',
      name: 'Clean Kitchen',
      skillLevel: 'BASIC',
      assignedTo: null,
      householdId: 'household1',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedChores: [],
    };

    const mockChoreWithHistory = {
      ...mockChore,
      completedChores: [
        {
          id: 'completed1',
          choreId: 'chore1',
          completedBy: 'user1',
          value: 30.0,
          completedAt: new Date(),
        },
      ],
    };

    it('should delete a chore successfully when no completion history exists', async () => {
      mockRequest.params = { id: 'chore1' };
      mockRequest.query = { householdId: 'household1' };

      mockPrisma.chore.findUnique.mockResolvedValue(mockChore);
      mockPrisma.chore.delete.mockResolvedValue(mockChore);

      await deleteChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.chore.findUnique).toHaveBeenCalledWith({
        where: { id: 'chore1' },
        include: { completedChores: true },
      });
      expect(mockPrisma.chore.delete).toHaveBeenCalledWith({
        where: { id: 'chore1' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Chore deleted successfully' },
      });
    });

    it('should return 400 if householdId is missing', async () => {
      mockRequest.params = { id: 'chore1' };
      mockRequest.query = {};

      await deleteChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Household ID is required',
          statusCode: 400,
        })
      );
    });

    it('should return 404 if chore not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.query = { householdId: 'household1' };

      mockPrisma.chore.findUnique.mockResolvedValue(null);

      await deleteChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Chore not found',
          statusCode: 404,
        })
      );
    });

    it('should return 404 if chore belongs to different household', async () => {
      mockRequest.params = { id: 'chore1' };
      mockRequest.query = { householdId: 'household2' };

      const choreFromDifferentHousehold = {
        ...mockChore,
        householdId: 'household1', // Different from query
      };

      mockPrisma.chore.findUnique.mockResolvedValue(choreFromDifferentHousehold);

      await deleteChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Chore not found in household',
          statusCode: 404,
        })
      );
    });

    it('should return 400 if chore has completion history', async () => {
      mockRequest.params = { id: 'chore1' };
      mockRequest.query = { householdId: 'household1' };

      mockPrisma.chore.findUnique.mockResolvedValue(mockChoreWithHistory);

      await deleteChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cannot delete chore with completion history',
          statusCode: 400,
        })
      );
      expect(mockPrisma.chore.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors during deletion', async () => {
      mockRequest.params = { id: 'chore1' };
      mockRequest.query = { householdId: 'household1' };

      mockPrisma.chore.findUnique.mockResolvedValue(mockChore);
      mockPrisma.chore.delete.mockRejectedValue(new Error('Database deletion error'));

      await deleteChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Database deletion error',
        })
      );
    });

    it('should handle database errors during chore lookup', async () => {
      mockRequest.params = { id: 'chore1' };
      mockRequest.query = { householdId: 'household1' };

      mockPrisma.chore.findUnique.mockRejectedValue(new Error('Database lookup error'));

      await deleteChore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Database lookup error',
        })
      );
      expect(mockPrisma.chore.delete).not.toHaveBeenCalled();
    });
  });
});