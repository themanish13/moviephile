import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://phlzghqrmnonncqvfwyb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobHpnaHFybW5vbm5jcXZmd3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjE4MjgsImV4cCI6MjA4NjI5NzgyOH0.PQ5hZEc8loqfeCe4CkRsC2qhAmcigK5S_3ahR2h6Rho';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for backend operations (bypasses RLS)
export const createServiceRoleClient = () => {
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobHpnaHFybW5vbm5jcXZmd3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcyMTgyOCwiZXhwIjoyMDg2Mjk3ODI4fQ.jAFeq9LJI6uz16ojoTusBO7u5s5Jz841LkSElPKB16Y';
  return createClient(supabaseUrl, serviceRoleKey);
};

export type { Session, User } from '@supabase/supabase-js';

