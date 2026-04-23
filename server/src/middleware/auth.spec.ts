import { verifyToken, AuthRequest } from './auth';
import * as admin from 'firebase-admin';
import { Response, NextFunction } from 'express';

const mockAuth = {
  verifyIdToken: jest.fn(),
};

jest.mock('firebase-admin', () => ({
  auth: jest.fn(() => mockAuth),
}));

describe('Auth Middleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() if token is valid', async () => {
    req.headers!.authorization = 'Bearer valid-token';
    const decodedToken = { uid: 'user123' };
    mockAuth.verifyIdToken.mockResolvedValue(decodedToken);

    await verifyToken(req as AuthRequest, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(decodedToken);
  });

  it('should return 401 if authorization header is missing', async () => {
    await verifyToken(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: 'unauthorized' })
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    req.headers!.authorization = 'Bearer invalid-token';
    mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

    await verifyToken(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
