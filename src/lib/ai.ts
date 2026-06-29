/**
 * A single word replacement from the AI evaluation.
 */
export interface ReplacedWord {
  basic: string;
  advanced: string;
}

/**
 * Parsed AI evaluation result.
 */
export interface EvaluationResult {
  score: number;
  upgraded_text: string;
  replaced_words: ReplacedWord[];
  feedback: string;
}

/**
 * Strip markdown code-block fences from the AI response text
 * so the raw JSON can be parsed.
 */
export function cleanAiResponse(text: string): string {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

/**
 * Parse a raw AI response string into a structured EvaluationResult.
 * Throws if the JSON is malformed.
 */
export function parseAiResponse(rawText: string): EvaluationResult {
  const cleaned = cleanAiResponse(rawText);
  return JSON.parse(cleaned) as EvaluationResult;
}

/**
 * Build the evaluation prompt sent to the Gemini model.
 */
export function buildEvaluationPrompt(scenario: string, text: string): string {
  return `You are a ruthless, elite corporate communications advisor evaluating a candidate for a technical advisory or consulting role. 
    They have provided a text response to the following scenario: "${scenario}".
    
    Evaluate their text strictly for C2-level vocabulary, executive diplomacy, and syntactical precision. Eliminate fluff.
    
    You MUST return ONLY a raw JSON object. Do not include markdown blocks, backticks, or any other text. The JSON must exactly match this structure:
    {
      "score": <number from 1 to 100 based on corporate nuance>,
      "upgraded_text": "<string: A flawless, corporate-advisory level rewrite of their exact text>",
      "replaced_words": [
        {"basic": "<string: a basic word they used>", "advanced": "<string: your elite upgrade>"}
      ],
      "feedback": "<string: One brutal, highly specific sentence of critique>"
    }
    
    User's Text to Evaluate: "${text}"`;
}

/**
 * Map AI replaced_words into the vocabulary table insert format.
 */
export function mapToVocabInserts(
  replacedWords: ReplacedWord[]
): { basic_word: string; c2_upgrade: string }[] {
  return replacedWords.map((w) => ({
    basic_word: w.basic,
    c2_upgrade: w.advanced,
  }));
}
