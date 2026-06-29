import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini API using the environment variable you set in Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text, scenario } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // We use the 1.5 Flash model because it is lightning-fast for text evaluation
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // The strict persona and formatting instructions
    const prompt = `You are a ruthless, elite corporate communications advisor. Your client is transitioning from B2 to C2 English. 
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
    const response = await result.response;
    let textResponse = response.text();
    
    // Clean up any potential markdown formatting Gemini might try to add
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(textResponse);

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("Evaluation Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze syntax. Check API logs." },
      { status: 500 }
    );
  }
}
