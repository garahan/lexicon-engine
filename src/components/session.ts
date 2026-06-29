export interface SessionSummary {
  kind: "lesson" | "review";
  title: string;
  xpGained: number;
  firstTryCorrect: number;
  totalFirstTry: number;
  bestCombo: number;
  mastered: boolean;
  itemsCleared: number;
  bonusActive: boolean;
}
