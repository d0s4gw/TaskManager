import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Middleware that extracts or generates a unique request ID for every inbound
 * request. The ID is read from the `X-Request-ID` header (if the upstream
 * proxy / load-balancer already assigned one) or generated as a UUID v4.
 *
 * The ID is attached to `req.requestId` and echoed back on the response via
 * the `X-Request-ID` header so callers can correlate responses to requests.
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = (req.headers['x-request-id'] as string) || crypto.randomUUID();

  req.requestId = id;
  res.setHeader('X-Request-ID', id);

  next();
};
