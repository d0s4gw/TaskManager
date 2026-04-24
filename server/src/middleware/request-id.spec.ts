import { requestId } from './request-id';
import { Request, Response, NextFunction } from 'express';

describe('Request ID Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      setHeader: jest.fn(),
    };
    next = jest.fn();
  });

  it('should generate a UUID when no X-Request-ID header is present', () => {
    requestId(req as Request, res as Response, next);

    expect(req.requestId).toBeDefined();
    // UUID v4 format check
    expect(req.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.requestId);
    expect(next).toHaveBeenCalled();
  });

  it('should use existing X-Request-ID header when present', () => {
    req.headers!['x-request-id'] = 'upstream-id-123';

    requestId(req as Request, res as Response, next);

    expect(req.requestId).toBe('upstream-id-123');
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', 'upstream-id-123');
    expect(next).toHaveBeenCalled();
  });
});
