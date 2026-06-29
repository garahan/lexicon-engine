import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Using our centralized, build-proof client

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_name', 'Admin').single();

    if (profile) {
      const lastCompleted = new Date(profile.last_completed_at).getTime();
      const now = new Date().getTime();
      const hoursSinceLastCompletion = (now - lastCompleted) / (1000 * 60 * 60);

      if (hoursSinceLastCompletion >= 48 && profile.streak_status !== 'broken') {
        await supabase.from('profiles').update({
          current_streak: 0,
          streak_status: 'broken'
        }).eq('user_name', 'Admin');
      } 
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
