import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/config.js';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = err.status || 500;

  console.error(`[${status}] ${err.message}`);
  if (config.nodeEnv !== 'production') console.error(err.stack);

  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv !== 'production' && { stack: err.stack }),
  });
};