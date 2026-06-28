import { createClient } from '@supabase/supabase-js';

type Database = any; 

// TEMPORARY BYPASS: Hardcode your real credentials directly
const supabaseUrl = " https://lhasptyhdyybbdphyrrm.supabase.co/rest/v1";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoYXNwdHloZHl5YmJkcGh5cnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzQ0NDksImV4cCI6MjA5NzM1MDQ0OX0.uDiGgYzTZvvqOti3wJwNyRGX5-kW44ArL_ei9Sc99T4";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables.'
  );
}

// Creating the single, shared client instance across your project
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);