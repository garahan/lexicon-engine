import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize APIs
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { text, scenario } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
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
    let textResponse = result.response.text();
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(textResponse);

    // --- SUPABASE INTEGRATION ---
    // 1. Fetch your current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_name', 'Admin')
      .single();

    if (profile) {
      // Calculate new stats (Score/10 adds to Elo)
      const newElo = profile.elo_rating + Math.floor(parsedData.score / 10);
      const newStreak = profile.current_streak + 1;
      const maxStreak = Math.max(profile.max_streak, newStreak);

      // 2. Update profile
      await supabase.from('profiles').update({
        elo_rating: newElo,
        current_streak: newStreak,
        max_streak: maxStreak,
        streak_status: 'active',
        last_completed_at: new Date().toISOString()
      }).eq('user_name', 'Admin');

      parsedData.new_elo = newElo;
      parsedData.new_streak = newStreak;
    }

    // 3. Log basic words to the Vocabulary Graveyard
    if (parsedData.replaced_words && parsedData.replaced_words.length > 0) {
      const vocabInserts = parsedData.replaced_words.map((w: any) => ({
        basic_word: w.basic,
        c2_upgrade: w.advanced
      }));
      await supabase.from('vocabulary').insert(vocabInserts);
    }

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("Evaluation Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze syntax. Check API logs." },
      { status: 500 }
    );
  }
}
