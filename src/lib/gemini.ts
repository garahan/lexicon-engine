export interface EvaluationResult {
  score: number;
  upgraded_text: string;
  replaced_words: { basic: string; advanced: string }[];
  feedback: string;
  new_elo?: number;
  new_streak?: number;
}

export function parseGeminiResponse(raw: string): EvaluationResult {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned) as EvaluationResult;
}
