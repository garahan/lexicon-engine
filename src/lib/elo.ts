/**
 * Corporate hierarchy tier derived from Elo rating.
 */
export type CorporateTier = "Analyst" | "Specialist" | "Technical Expert" | "Strategist / Advisory";

/**
 * Profile data relevant to Elo and streak calculations.
 */
export interface ProfileData {
  elo_rating: number;
  current_streak: number;
  max_streak: number;
}

/**
 * Result of an Elo/streak update after a successful evaluation.
 */
export interface ProfileUpdate {
  elo_rating: number;
  current_streak: number;
  max_streak: number;
  streak_status: "active";
  last_completed_at: string;
}

/**
 * Calculate the Elo delta from an evaluation score.
 * The score (1–100) is divided by 10 and floored.
 */
export function calculateEloDelta(score: number): number {
  return Math.floor(score / 10);
}

/**
 * Calculate the new Elo rating after an evaluation.
 */
export function calculateNewElo(currentElo: number, score: number): number {
  return currentElo + calculateEloDelta(score);
}

/**
 * Compute the full profile update after a successful evaluation.
 */
export function computeProfileUpdate(profile: ProfileData, score: number): ProfileUpdate {
  const newElo = calculateNewElo(profile.elo_rating, score);
  const newStreak = profile.current_streak + 1;
  const maxStreak = Math.max(profile.max_streak, newStreak);

  return {
    elo_rating: newElo,
    current_streak: newStreak,
    max_streak: maxStreak,
    streak_status: "active",
    last_completed_at: new Date().toISOString(),
  };
}

/**
 * Determine the corporate hierarchy tier for a given Elo rating.
 */
export function getCorporateTier(elo: number): CorporateTier {
  if (elo >= 1800) return "Strategist / Advisory";
  if (elo >= 1500) return "Technical Expert";
  if (elo >= 1300) return "Specialist";
  return "Analyst";
}
