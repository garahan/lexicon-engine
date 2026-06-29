import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using the service role key.
 * MUST only be used in API routes / server-side code — never expose to the client.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://build-fallback.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build-fallback-key';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
