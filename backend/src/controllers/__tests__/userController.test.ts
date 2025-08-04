import { Request, Response, NextFunction } from 'express';
import { createUser, getUser } from '../userController';
import { prisma } from '../../models';

// Mock Prisma
jest.mock('../../models', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('UserController', () => {
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

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockUser = {
        id: 'user1',
        firstName: 'Alice',
        householdId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = { firstName: 'Alice' };
      mockedPrisma.user.create.mockResolvedValue(mockUser);

      await createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: { firstName: 'Alice' },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser },
      });
    });

    it('should handle validation errors', async () => {
      mockRequest.body = { firstName: '' };

      await createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockRequest.body = { firstName: 'Alice' };
      mockedPrisma.user.create.mockRejectedValue(new Error('Database error'));

      await createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getUser', () => {
    it('should get user successfully', async () => {
      const mockUser = {
        id: 'user1',
        firstName: 'Alice',
        householdId: 'household1',
        createdAt: new Date(),
        updatedAt: new Date(),
        household: {
          id: 'household1',
          name: 'Test Household',
          inviteCode: 'TEST123',
          baseRate: 15.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockRequest.params = { id: 'user1' };
      mockedPrisma.user.findUnique.mockResolvedValue(mockUser);

      await getUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' },
        include: { household: true },
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser },
      });
    });

    it('should handle user not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      await getUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found',
          statusCode: 404,
        })
      );
    });
  });
});