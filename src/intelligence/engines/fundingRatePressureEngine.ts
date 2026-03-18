
import type { EngineResult } from '@/engines/types/Engine';

export function runFundingRatePressureEngine(history: number[]): EngineResult {

  const neutralResult: EngineResult = {
    engine: "FundingRatePressure",
    signal: "NEUTRAL",
    confidence: 0,
    weight: 0,
    timestamp: Date.now()
  };
  
  if (!history || history.length === 0) {
    return neutralResult;
  }

  const latest = history[history.length - 1]

  // Extreme funding rates can signal trend exhaustion and a potential reversal.
  // Very high positive funding (longs paying shorts) is a bearish contrarian signal.
  if (latest > 0.001) { // 0.1% is quite high
    return {
      engine: "FundingRatePressure",
      signal: "SELL",
      confidence: Math.min(1, latest / 0.002),
      weight: 0.35,
      reason: "Extreme positive funding rate suggests overheated longs, potential for reversal.",
      timestamp: Date.now()
    }
  }

  // Very low negative funding (shorts paying longs) is a bullish contrarian signal.
  if (latest < -0.001) {
    return {
      engine: "FundingRatePressure",
      signal: "BUY",
      confidence: Math.min(1, Math.abs(latest) / 0.002),
      weight: 0.35,
      reason: "Extreme negative funding rate suggests overheated shorts, potential for reversal.",
      timestamp: Date.now()
    }
  }

  return neutralResult;
}
