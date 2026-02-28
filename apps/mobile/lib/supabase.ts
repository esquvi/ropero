import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ihwkmkdtlcmrhomlyalx.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlod2tta2R0bGNtcmhvbWx5YWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTcyNTIsImV4cCI6MjA4Nzg3MzI1Mn0.CcN08hWfBdjmaZgB1CajhLpPn-r-c2wuKG6OI9Jbn-w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
