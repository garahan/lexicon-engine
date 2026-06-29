import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { computeProfileUpdate } from "@/lib/elo";
import { parseAiResponse, buildEvaluationPrompt, mapToVocabInserts } from "@/lib/ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text, scenario } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildEvaluationPrompt(scenario, text);

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const parsedData = parseAiResponse(textResponse);
    const responseData: Record<string, unknown> = { ...parsedData };

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_name', 'Admin')
      .single();

    if (profile) {
      const update = computeProfileUpdate(profile, parsedData.score);

      await supabase.from('profiles').update(update).eq('user_name', 'Admin');

      responseData.new_elo = update.elo_rating;
      responseData.new_streak = update.current_streak;
    }

    if (parsedData.replaced_words && parsedData.replaced_words.length > 0) {
      const vocabInserts = mapToVocabInserts(parsedData.replaced_words);
      await supabase.from('vocabulary').insert(vocabInserts);
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Evaluation Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze syntax. Check API logs." },
      { status: 500 }
    );
  }
}
