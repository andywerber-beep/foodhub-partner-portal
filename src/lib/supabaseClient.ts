import { createClient } from '@supabase/supabase-js';

type Database = any; 

const supabaseUrl = "https://lhasptyhdyybbdphyrrm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoYXNwdHloZHl5YmJkcGh5cnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzQ0NDksImV4cCI6MjA5NzM1MDQ0OX0.uDiGgYzTZvvqOti3wJwNyRGX5-kW44ArL_ei9Sc99T4";

// Pure client initialization with no strict string comparison checks
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);