export const ADMIN_USERNAME = 'Admin';

export const STREAK_STATUS = {
  ACTIVE: 'active',
  FRACTURED: 'fractured',
  BROKEN: 'broken',
} as const;

export type StreakStatus = typeof STREAK_STATUS[keyof typeof STREAK_STATUS];

export const STREAK_THRESHOLDS = {
  FRACTURED_HOURS: 24,
  BROKEN_HOURS: 48,
} as const;

export const ELO_RANKS = [
  { title: 'Analyst', minElo: 0 },
  { title: 'Specialist', minElo: 1300 },
  { title: 'Technical Expert', minElo: 1500 },
  { title: 'Strategist / Advisory', minElo: 1800 },
] as const;

export const DEFAULT_ELO = 1200;
