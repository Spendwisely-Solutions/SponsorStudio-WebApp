import { supabase } from '../config/supabase';

export class UserRepository {
  /**
   * Resolves a user's registered email address from the public `profiles` table.
   * This is accessible using standard credentials without requiring service_role auth permissions.
   */
  async findEmailById(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error(`Database query failed for profile email of user ${userId}:`, error);
      throw error;
    }

    return data?.email || null;
  }
}
