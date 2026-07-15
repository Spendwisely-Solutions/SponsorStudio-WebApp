import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { UserType, AuthenticatedUser } from '../types/auth.types';

/**
 * Middleware to authenticate requests by validating the Supabase JWT.
 * It also fetches the user profile data to attach domain roles and details to the Request.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized: Missing or malformed authentication header.',
          code: 'MISSING_TOKEN'
        }
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Delegate token signature validation, expiration, and session status to Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized: Invalid or expired token.',
          code: 'INVALID_TOKEN'
        }
      });
      return;
    }

    // Query profiles table to retrieve role (user_type) and details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type, company_name, profile_picture_url, location')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error(`Profile retrieval failed for auth user ${user.id}:`, profileError);
      res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized: User profile records not found.',
          code: 'PROFILE_NOT_FOUND'
        }
      });
      return;
    }

    // Formulate custom AuthenticatedUser structure to isolate domain business code from vendor APIs
    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email || '',
      userType: profile.user_type as UserType,
      profile: {
        companyName: profile.company_name,
        profilePictureUrl: profile.profile_picture_url,
        location: profile.location
      }
    };

    req.user = authenticatedUser;
    next();
  } catch (error) {
    console.error('Error during token and profile authentication processing:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'An internal error occurred during authentication.',
        code: 'INTERNAL_AUTH_ERROR'
      }
    });
  }
}
