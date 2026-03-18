
import type { EngineResult } from '@/engines/types/Engine';

export function runOpenInterestShockEngine(history: number[]): EngineResult {

  const neutralResult: EngineResult = {
    engine: "OpenInterestShock",
    signal: "NEUTRAL",
    confidence: 0,
    weight: 0,
    timestamp: Date.now()
  };

  if (!history || history.length < 2) {
    return neutralResult;
  }

  const latest = history[history.length - 1]
  const prev = history[history.length - 2]
  const change = (latest - prev) / prev

  if (Math.abs(change) < 0.02) { // 2% change threshold
    return neutralResult;
  }
  
  // Rapid OI increase often precedes volatility (fuel). Bullish if price is rising, Bearish if price is falling.
  // Rapid OI decrease signifies closing positions, often a trend reversal or exhaustion.
  const signal = change > 0 ? "NEUTRAL" : "NEUTRAL"; // Signal is contextual, so we stay neutral here.

  return {
    engine: "OpenInterestShock",
    signal: signal,
    confidence: Math.min(1, Math.abs(change) * 10),
    weight: 0.15,
    reason: `Open interest shock detected: ${change > 0 ? 'increase' : 'decrease'} of ${(change*100).toFixed(1)}%`,
    timestamp: Date.now()
  };
}
