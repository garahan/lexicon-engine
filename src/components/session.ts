export interface SessionSummary {
  kind: "lesson" | "review" | "challenge" | "quickwin" | "checkpoint";
  title: string;
  xpGained: number;
  firstTryCorrect: number;
  totalFirstTry: number;
  bestCombo: number;
  mastered: boolean;
  itemsCleared: number;
  bonusActive: boolean;
}
