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

  // E2E Test / Local Dev Bypass
  if (process.env.NODE_ENV === 'development' && token === 'e2e-mock-firebase-id-token') {
    logger.info('Using E2E mock auth bypass', { requestId: req.requestId });
    req.user = {
      uid: 'mock-user-123',
      email: 'agent@test.com',
      name: 'Agent Gemini',
      picture: 'https://lh3.googleusercontent.com/a/mock',
      auth_time: Math.floor(Date.now() / 1000),
      iss: 'https://securetoken.google.com/mock-project',
      aud: 'mock-project',
      sub: 'mock-user-123',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      firebase: {
        identities: { 'google.com': ['agent@test.com'] },
        sign_in_provider: 'google.com'
      }
    } as admin.auth.DecodedIdToken;
    return next();
  }

  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    const appCheckToken = req.headers['x-firebase-appcheck'];
    if (!appCheckToken || typeof appCheckToken !== 'string') {
      logger.warn('Missing App Check token', { requestId: req.requestId });
      return res.status(401).json({
        success: false,
        error: { code: 'unauthorized', message: 'Missing App Check token' }
      });
    }
    try {
      await admin.appCheck().verifyToken(appCheckToken);
    } catch (error) {
      logger.warn('App Check token verification failed', {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(401).json({
        success: false,
        error: { code: 'unauthorized', message: 'Invalid App Check token' }
      });
    }
  }

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
