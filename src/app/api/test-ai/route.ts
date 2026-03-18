import { NextResponse } from "next/server"
import { ai } from "@/ai/genkit"

export const dynamic = 'force-dynamic';

export async function GET() {

  try {

    const response = await ai.generate({
      model: "googleai/gemini-1.5-flash",
      prompt: "Say: AI is working"
    });

    const text = response.text;

    return NextResponse.json({
      ok: true,
      response: text
    });

  } catch (err) {

    console.error("AI TEST FAILED", err);

    return NextResponse.json({
      ok: false,
      error: "ai_test_failed"
    }, { status: 500 });
  }
}
