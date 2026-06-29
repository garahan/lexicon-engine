import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function GET(req: Request) {
  // Security check to ensure only Vercel can trigger this
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_name', 'Admin').single();

    if (profile) {
      const lastCompleted = new Date(profile.last_completed_at).getTime();
      const now = new Date().getTime();
      const hoursSinceLastCompletion = (now - lastCompleted) / (1000 * 60 * 60);

      // If more than 48 hours passed, break the streak entirely
      if (hoursSinceLastCompletion >= 48 && profile.streak_status !== 'broken') {
        await supabase.from('profiles').update({
          current_streak: 0,
          streak_status: 'broken'
        }).eq('user_name', 'Admin');
      } 
      // If between 24 and 48 hours, fracture the streak
      else if (hoursSinceLastCompletion >= 24 && profile.streak_status === 'active') {
        await supabase.from('profiles').update({
          streak_status: 'fractured'
        }).eq('user_name', 'Admin');
      }
    }

    return NextResponse.json({ success: true, message: "Streak audit complete." });
  } catch (error) {
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
