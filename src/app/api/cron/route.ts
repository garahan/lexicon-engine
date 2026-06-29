import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateHoursSince, determineStreakStatus } from "@/lib/streak";

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_name', 'Admin').single();

    if (profile) {
      const hoursSince = calculateHoursSince(profile.last_completed_at);
      const auditResult = determineStreakStatus(hoursSince, profile.streak_status);

      if (auditResult.status !== profile.streak_status) {
        const updateData: Record<string, unknown> = { streak_status: auditResult.status };
        if (auditResult.resetStreak) {
          updateData.current_streak = 0;
        }
        await supabase.from('profiles').update(updateData).eq('user_name', 'Admin');
      }
    }

    return NextResponse.json({ success: true, message: "Streak audit complete." });
  } catch (error) {
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
