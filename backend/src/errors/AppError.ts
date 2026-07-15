/**
 * Custom application error class representing expected operational errors (e.g. invalid inputs, 
 * unauthorized requests, resource not found) that should return standard HTTP error responses.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Captures the current stack trace, excluding the constructor from the trace output
    Error.captureStackTrace(this, this.constructor);
  }
}
