import { Request, Response, NextFunction } from 'express';
import { UserType } from '../types/auth.types';
import { AppError } from '../errors/AppError';

/**
 * Middleware factory to enforce role-based access control.
 * Binds checks to req.user.userType populated by authMiddleware.
 */
export function requireRole(...allowedRoles: UserType[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        throw new AppError('Authentication credentials are missing.', 401);
      }

      if (!allowedRoles.includes(user.userType)) {
        throw new AppError('Forbidden: Access is denied for your user type.', 403);
      }

      next();
    } catch (error) {
      // Forward to global Express error handler
      next(error);
    }
  };
}
