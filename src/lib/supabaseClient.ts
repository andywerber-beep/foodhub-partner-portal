import { createClient } from '@supabase/supabase-js';

// Type definition for the database layout
type Database = any; 

// Cleaned base URL and authorization keys 
const supabaseUrl = "https://lhasptyhdyybbdphyrrm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoYXNwdHloZHl5YmJkcGh5cnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzQ0NDksImV4cCI6MjA5NzM1MDQ0OX0.uDiGgYzTZvvqOti3wJwNyRGX5-kW44ArL_ei9Sc99T4";

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === "YOUR_ACTUAL_SUPABASE_ANON_KEY_HERE") {
  console.error(
    'Please ensure you have replaced YOUR_ACTUAL_SUPABASE_ANON_KEY_HERE with your real string from your .env file.'
  );
}

// Creating the single, shared client instance across your project
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);