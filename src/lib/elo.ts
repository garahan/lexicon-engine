import { ELO_RANKS } from './constants';

export function calculateNewElo(currentElo: number, score: number): number {
  return currentElo + Math.floor(score / 10);
}

export function getRankTitle(elo: number): string {
  let rank: string = ELO_RANKS[0].title;
  for (const r of ELO_RANKS) {
    if (elo >= r.minElo) {
      rank = r.title;
    }
  }
  return rank;
}
