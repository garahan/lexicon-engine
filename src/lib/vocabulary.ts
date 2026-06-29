import { supabase } from './supabase';

export async function insertReplacedWords(
  words: { basic: string; advanced: string }[]
) {
  if (words.length === 0) return;

  const rows = words.map((w) => ({
    basic_word: w.basic,
    c2_upgrade: w.advanced,
  }));

  await supabase.from('vocabulary').insert(rows);
}
