import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

/**
 * Centralized Express error handler middleware.
 * Formats operational, validation, and system exceptions into standard JSON error envelopes.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Case A: Zod Schema Validation Failure
  if (err instanceof ZodError) {
    const fields = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Request payload validation failed.',
        code: 'VALIDATION_ERROR',
        details: fields
      }
    });
    return;
  }

  // Case B: Explicit Operational Error (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.statusCode === 401 ? 'UNAUTHORIZED' : err.statusCode === 403 ? 'FORBIDDEN' : err.statusCode === 404 ? 'NOT_FOUND' : 'BAD_REQUEST'
      }
    });
    return;
  }

  // Case C: Unhandled System Crash/Programmer Bug
  console.error('Unhandled system exception caught in global error boundary:', err);

  res.status(500).json({
    success: false,
    error: {
      message: 'An unexpected internal server error occurred.',
      code: 'INTERNAL_SERVER_ERROR'
    }
  });
}
