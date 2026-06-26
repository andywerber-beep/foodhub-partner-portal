import { createClient } from '@supabase/supabase-js';

// Replace these with your actual TypeScript definitions if you have generated them via Supabase CLI
// e.g., import { Database } from '../types/supabase';
type Database = any; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Creating the single, shared client instance across your Brighton project
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
);