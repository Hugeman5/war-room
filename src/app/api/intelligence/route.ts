
import { NextResponse } from "next/server"
import { runFullDecision } from "@/brain/runFullDecision"

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log("OPENAI KEY PRESENT:", !!process.env.OPENAI_API_KEY);

  try {
    // The runFullDecision is now the full orchestrator
    const fullSnapshot = await runFullDecision()

    return NextResponse.json(fullSnapshot)

  } catch (err) {

    console.error("INTELLIGENCE PIPELINE FAILURE", err)

    return NextResponse.json({
      ok: false,
      error: "pipeline_failure"
    }, { status: 500 })
  }

}
