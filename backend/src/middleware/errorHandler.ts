import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  console.error('Unhandled error:', err);
  sendError(res, 'Internal server error', 500);
}
