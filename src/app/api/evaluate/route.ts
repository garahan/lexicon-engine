import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

const MAX_TEXT_LENGTH = 5000;
const MAX_SCENARIO_LENGTH = 1000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // --- Auth check: require a valid session token or API key ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { text, scenario } = body;

    // --- Input validation ---
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (scenario && typeof scenario !== "string") {
      return NextResponse.json({ error: "Invalid scenario format" }, { status: 400 });
    }

    if (scenario && scenario.length > MAX_SCENARIO_LENGTH) {
      return NextResponse.json(
        { error: `Scenario exceeds maximum length of ${MAX_SCENARIO_LENGTH} characters` },
        { status: 400 }
      );
    }

    const sanitizedText = text.trim();
    const sanitizedScenario = scenario ? scenario.trim() : "General corporate communication";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a ruthless, elite corporate communications advisor evaluating a candidate for a technical advisory or consulting role. 
    They have provided a text response to the following scenario: "${sanitizedScenario}".
    
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
    
    User's Text to Evaluate: "${sanitizedText}"`;

    const result = await model.generateContent(prompt);
    let textResponse = result.response.text();
    textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsedData;
    try {
      parsedData = JSON.parse(textResponse);
    } catch {
      return NextResponse.json(
        { error: "AI returned malformed response. Please try again." },
        { status: 502 }
      );
    }

    // --- Validate AI response structure ---
    if (
      typeof parsedData.score !== "number" ||
      parsedData.score < 0 ||
      parsedData.score > 100 ||
      typeof parsedData.upgraded_text !== "string" ||
      typeof parsedData.feedback !== "string" ||
      !Array.isArray(parsedData.replaced_words)
    ) {
      return NextResponse.json(
        { error: "AI returned an invalid response structure. Please try again." },
        { status: 502 }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_name", "Admin")
      .single();

    if (profile) {
      const newElo = profile.elo_rating + Math.floor(parsedData.score / 10);
      const newStreak = profile.current_streak + 1;
      const maxStreak = Math.max(profile.max_streak, newStreak);

      await supabaseAdmin
        .from("profiles")
        .update({
          elo_rating: newElo,
          current_streak: newStreak,
          max_streak: maxStreak,
          streak_status: "active",
          last_completed_at: new Date().toISOString(),
        })
        .eq("user_name", "Admin");

      parsedData.new_elo = newElo;
      parsedData.new_streak = newStreak;
    }

    if (parsedData.replaced_words && parsedData.replaced_words.length > 0) {
      const vocabInserts = parsedData.replaced_words
        .filter(
          (w: { basic?: string; advanced?: string }) =>
            typeof w.basic === "string" && typeof w.advanced === "string"
        )
        .map((w: { basic: string; advanced: string }) => ({
          basic_word: w.basic.slice(0, 200),
          c2_upgrade: w.advanced.slice(0, 200),
        }));

      if (vocabInserts.length > 0) {
        await supabaseAdmin.from("vocabulary").insert(vocabInserts);
      }
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Evaluation Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze syntax. Please try again later." },
      { status: 500 }
    );
  }
}
