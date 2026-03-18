import { EngineResult } from "@/engines/types/Engine"

export async function runEngine(
  engineName: string,
  engineFn: () => EngineResult | Promise<EngineResult>
): Promise<EngineResult> {

  try {
    const result = await engineFn()

    return {
      engine: engineName,
      signal: result.signal ?? "NEUTRAL",
      confidence: result.confidence ?? 0,
      weight: result.weight ?? 0,
      reason: result.reason,
      timestamp: Date.now()
    }

  } catch (err) {

    console.error("ENGINE FAILURE:", engineName, err)

    return {
      engine: engineName,
      signal: "NEUTRAL",
      confidence: 0,
      weight: 0,
      reason: "Engine failure",
      timestamp: Date.now()
    }
  }
}
