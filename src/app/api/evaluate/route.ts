import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not configured. The /api/evaluate endpoint will not function.");
}
const genAI = new GoogleGenerativeAI(apiKey || "");

interface ReplacedWord {
  basic: string;
  advanced: string;
}

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfiguration: AI evaluation service is unavailable." },
      { status: 503 }
    );
  }

  let text: string;
  let scenario: string;

  try {
    const body = await req.json();
    text = body.text;
    scenario = body.scenario;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body: expected JSON with 'text' and 'scenario' fields." },
      { status: 400 }
    );
  }

  if (!text) {
    return NextResponse.json({ error: "No text provided." }, { status: 400 });
  }

  if (!scenario) {
    return NextResponse.json({ error: "No scenario provided." }, { status: 400 });
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

  let parsedData: { score: number; upgraded_text: string; replaced_words: ReplacedWord[]; feedback: string; new_elo?: number; new_streak?: number };

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      parsedData = JSON.parse(textResponse);
    } catch (parseError) {
      console.error("AI response was not valid JSON:", textResponse);
      return NextResponse.json(
        { error: "AI returned a malformed response. Please try again." },
        { status: 502 }
      );
    }
  } catch (aiError) {
    console.error("Gemini API call failed:", aiError);
    return NextResponse.json(
      { error: "AI evaluation service is temporarily unavailable." },
      { status: 502 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_name', 'Admin')
    .single();

  if (profileError) {
    console.error("Failed to fetch user profile:", profileError.message);
    return NextResponse.json(
      { error: "Unable to load user profile. Database may be unavailable." },
      { status: 503 }
    );
  }

  if (!profile) {
    console.error("User profile not found for 'Admin'.");
    return NextResponse.json(
      { error: "User profile not found." },
      { status: 404 }
    );
  }

  const newElo = profile.elo_rating + Math.floor(parsedData.score / 10);
  const newStreak = profile.current_streak + 1;
  const maxStreak = Math.max(profile.max_streak, newStreak);

  const { error: updateError } = await supabase.from('profiles').update({
    elo_rating: newElo,
    current_streak: newStreak,
    max_streak: maxStreak,
    streak_status: 'active',
    last_completed_at: new Date().toISOString()
  }).eq('user_name', 'Admin');

  if (updateError) {
    console.error("Failed to update user profile:", updateError.message);
    return NextResponse.json(
      { error: "Evaluation succeeded but failed to save progress. Please try again." },
      { status: 500 }
    );
  }

  parsedData.new_elo = newElo;
  parsedData.new_streak = newStreak;

  if (parsedData.replaced_words && parsedData.replaced_words.length > 0) {
    const vocabInserts = parsedData.replaced_words.map((w: ReplacedWord) => ({
      basic_word: w.basic,
      c2_upgrade: w.advanced
    }));

    const { error: vocabError } = await supabase.from('vocabulary').insert(vocabInserts);
    if (vocabError) {
      console.error("Failed to insert vocabulary entries:", vocabError.message);
    }
  }

  return NextResponse.json(parsedData);
}
