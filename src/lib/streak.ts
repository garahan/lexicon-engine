import { STREAK_STATUS, STREAK_THRESHOLDS, StreakStatus } from './constants';

export function getHoursSinceCompletion(lastCompletedAt: string): number {
  const lastCompleted = new Date(lastCompletedAt).getTime();
  const now = Date.now();
  return (now - lastCompleted) / (1000 * 60 * 60);
}

export function determineStreakTransition(
  hoursSince: number,
  currentStatus: StreakStatus
): { streak_status: StreakStatus; current_streak?: number } | null {
  if (hoursSince >= STREAK_THRESHOLDS.BROKEN_HOURS && currentStatus !== STREAK_STATUS.BROKEN) {
    return { streak_status: STREAK_STATUS.BROKEN, current_streak: 0 };
  }
  if (hoursSince >= STREAK_THRESHOLDS.FRACTURED_HOURS && currentStatus === STREAK_STATUS.ACTIVE) {
    return { streak_status: STREAK_STATUS.FRACTURED };
  }
  return null;
}
