import { createClient } from '@supabase/supabase-js';

// We provide a dummy URL fallback so the Next.js static build process never crashes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://build-fallback.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build-fallback-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
