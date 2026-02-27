import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createClient(supabaseUrl, supabaseAnonKey);
}
