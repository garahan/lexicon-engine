import { supabase } from './supabase';
import { ADMIN_USERNAME } from './constants';

export async function getAdminProfile() {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_name', ADMIN_USERNAME)
    .single();
  return data;
}

export async function updateAdminProfile(updates: Record<string, unknown>) {
  return supabase
    .from('profiles')
    .update(updates)
    .eq('user_name', ADMIN_USERNAME);
}
