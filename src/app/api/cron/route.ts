import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_name", "Admin")
      .single();

    if (profile) {
      const lastCompleted = new Date(profile.last_completed_at).getTime();
      const now = Date.now();
      const hoursSinceLastCompletion = (now - lastCompleted) / (1000 * 60 * 60);

      if (hoursSinceLastCompletion >= 48 && profile.streak_status !== "broken") {
        await supabaseAdmin
          .from("profiles")
          .update({
            current_streak: 0,
            streak_status: "broken",
          })
          .eq("user_name", "Admin");
      } else if (
        hoursSinceLastCompletion >= 24 &&
        profile.streak_status === "active"
      ) {
        await supabaseAdmin
          .from("profiles")
          .update({
            streak_status: "fractured",
          })
          .eq("user_name", "Admin");
      }
    }

    return NextResponse.json({ success: true, message: "Streak audit complete." });
  } catch {
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
