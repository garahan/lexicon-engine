import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAdminProfile, updateAdminProfile } from "@/lib/profile";
import { calculateNewElo } from "@/lib/elo";
import { parseGeminiResponse } from "@/lib/gemini";
import { insertReplacedWords } from "@/lib/vocabulary";
import { errorResponse, successResponse } from "@/lib/api";
import { STREAK_STATUS } from "@/lib/constants";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text, scenario } = await req.json();

    if (!text) {
      return errorResponse("No text provided", 400);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a ruthless, elite corporate communications advisor evaluating a candidate for a technical advisory or consulting role. 
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

    const result = await model.generateContent(prompt);
    const parsedData = parseGeminiResponse(result.response.text());

    const profile = await getAdminProfile();

    if (profile) {
      const newElo = calculateNewElo(profile.elo_rating, parsedData.score);
      const newStreak = profile.current_streak + 1;
      const maxStreak = Math.max(profile.max_streak, newStreak);

      await updateAdminProfile({
        elo_rating: newElo,
        current_streak: newStreak,
        max_streak: maxStreak,
        streak_status: STREAK_STATUS.ACTIVE,
        last_completed_at: new Date().toISOString(),
      });

      parsedData.new_elo = newElo;
      parsedData.new_streak = newStreak;
    }

    if (parsedData.replaced_words && parsedData.replaced_words.length > 0) {
      await insertReplacedWords(parsedData.replaced_words);
    }

    return successResponse(parsedData);

  } catch (error) {
    console.error("Evaluation Error:", error);
    return errorResponse("Failed to analyze syntax. Check API logs.", 500);
  }
}
