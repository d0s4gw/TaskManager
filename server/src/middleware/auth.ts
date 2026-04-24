import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import logger from '../logger';

export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'unauthorized', message: 'Missing or invalid token' }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.warn('Token verification failed', {
      requestId: req.requestId,
      tokenSuffix: token.slice(-10),
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(401).json({
      success: false,
      error: { code: 'unauthorized', message: 'Token verification failed' }
    });
  }
};
