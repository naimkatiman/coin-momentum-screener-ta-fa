// ============================================================
// Error Handler Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error, 
  _req: Request, 
  res: Response, 
  _next: NextFunction
) {
  console.error('Unhandled error:', err.message);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString(),
  });
}
