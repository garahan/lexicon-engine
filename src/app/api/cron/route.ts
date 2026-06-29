import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET is not configured. Streak audit cannot authenticate.");
    return NextResponse.json(
      { error: "Server misconfiguration: cron authentication unavailable." },
      { status: 503 }
    );
  }

  if (req.headers.get('Authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_name', 'Admin')
    .single();

  if (profileError) {
    console.error("Streak audit failed to fetch profile:", profileError.message);
    return NextResponse.json(
      { error: "Audit failed: unable to fetch user profile.", details: profileError.message },
      { status: 500 }
    );
  }

  if (!profile) {
    console.error("Streak audit: no profile found for 'Admin'.");
    return NextResponse.json(
      { error: "Audit failed: user profile not found." },
      { status: 404 }
    );
  }

  const lastCompleted = new Date(profile.last_completed_at).getTime();
  const now = Date.now();
  const hoursSinceLastCompletion = (now - lastCompleted) / (1000 * 60 * 60);

  if (hoursSinceLastCompletion >= 48 && profile.streak_status !== 'broken') {
    const { error: updateError } = await supabase.from('profiles').update({
      current_streak: 0,
      streak_status: 'broken'
    }).eq('user_name', 'Admin');

    if (updateError) {
      console.error("Streak audit failed to break streak:", updateError.message);
      return NextResponse.json(
        { error: "Audit failed: could not update streak status.", details: updateError.message },
        { status: 500 }
      );
    }
  } else if (hoursSinceLastCompletion >= 24 && profile.streak_status === 'active') {
    const { error: updateError } = await supabase.from('profiles').update({
      streak_status: 'fractured'
    }).eq('user_name', 'Admin');

    if (updateError) {
      console.error("Streak audit failed to fracture streak:", updateError.message);
      return NextResponse.json(
        { error: "Audit failed: could not update streak status.", details: updateError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true, message: "Streak audit complete." });
}
