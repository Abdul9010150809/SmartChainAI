import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error
    ? Number((error as { statusCode?: number }).statusCode) || 500
    : 500;

  const message = error instanceof Error ? error.message : 'Internal server error';

  logger.error(message, error instanceof Error ? { stack: error.stack } : undefined);
  res.status(statusCode).json({ message });
}