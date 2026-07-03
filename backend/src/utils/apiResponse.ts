import { Response } from 'express';

export function sendSuccess(res: Response, message: string, data?: any, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res: Response, message: string, statusCode = 500, errors?: string[]) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: message,
    ...(errors && { errors }),
  });
}
