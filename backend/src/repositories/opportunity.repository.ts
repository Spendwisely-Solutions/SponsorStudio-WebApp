import { supabase } from '../config/supabase';

export class OpportunityRepository {
  /**
   * Fetches all active opportunities from the Supabase database.
   */
  async findAll() {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }
}
