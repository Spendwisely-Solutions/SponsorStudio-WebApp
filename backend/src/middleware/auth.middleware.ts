import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

/**
 * Middleware to verify a user's session token with Supabase.
 * Extracts the Bearer token from the Authorization header and validates it.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or malformed authentication header.'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Delegate token signature validation, expiration, and session status to Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired token.'
      });
      return;
    }

    // Attach the user record to the Request object for downstream controllers
    req.user = user;

    next();
  } catch (error) {
    console.error('Error verifying authentication token in authMiddleware:', error);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred during authentication.'
    });
  }
}
