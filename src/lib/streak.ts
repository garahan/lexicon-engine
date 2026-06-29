/**
 * Possible streak statuses in the Elastic Streak System.
 */
export type StreakStatus = "active" | "fractured" | "broken";

/**
 * Result of a streak audit evaluation.
 */
export interface StreakAuditResult {
  status: StreakStatus;
  resetStreak: boolean;
}

/**
 * Calculate the number of hours elapsed since a given ISO date string.
 */
export function calculateHoursSince(dateString: string, now?: Date): number {
  const lastCompleted = new Date(dateString).getTime();
  const currentTime = (now ?? new Date()).getTime();
  return (currentTime - lastCompleted) / (1000 * 60 * 60);
}

/**
 * Determine the new streak status based on hours since last completion
 * and the current streak status.
 *
 * Rules (Elastic Streak System):
 * - >= 48 hours && not already broken → broken (streak resets to 0)
 * - >= 24 hours && currently active → fractured (warning state)
 * - Otherwise → no change
 */
export function determineStreakStatus(
  hoursSinceLastCompletion: number,
  currentStatus: StreakStatus
): StreakAuditResult {
  if (hoursSinceLastCompletion >= 48 && currentStatus !== "broken") {
    return { status: "broken", resetStreak: true };
  }

  if (hoursSinceLastCompletion >= 24 && currentStatus === "active") {
    return { status: "fractured", resetStreak: false };
  }

  return { status: currentStatus, resetStreak: false };
}
