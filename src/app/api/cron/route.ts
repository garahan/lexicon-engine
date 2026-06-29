import { getAdminProfile, updateAdminProfile } from "@/lib/profile";
import { getHoursSinceCompletion, determineStreakTransition } from "@/lib/streak";
import { errorResponse, successResponse } from "@/lib/api";
import { StreakStatus } from "@/lib/constants";

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const profile = await getAdminProfile();

    if (profile) {
      const hoursSince = getHoursSinceCompletion(profile.last_completed_at);
      const transition = determineStreakTransition(
        hoursSince,
        profile.streak_status as StreakStatus
      );

      if (transition) {
        await updateAdminProfile(transition);
      }
    }

    return successResponse({ success: true, message: "Streak audit complete." });
  } catch {
    return errorResponse("Audit failed", 500);
  }
}
