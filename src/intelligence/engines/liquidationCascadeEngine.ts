
import type { EngineResult } from '@/engines/types/Engine';
import type { LiquidationOrder } from '@/market/data';

type LiquidationData = {
    value: number;
    side: 'long' | 'short';
}

export function runLiquidationCascadeEngine(liquidations: LiquidationData[]): EngineResult {

  const neutralResult: EngineResult = {
    engine: "LiquidationCascade",
    signal: "NEUTRAL",
    confidence: 0,
    weight: 0,
    timestamp: Date.now()
  };

  if (!liquidations || liquidations.length === 0) {
    return neutralResult;
  }

  const totalValue = liquidations.reduce((sum, l) => sum + (l.value || 0), 0)

  if (totalValue < 500000) { // Only trigger on significant cascades
    return neutralResult;
  }

  const longLiquidations = liquidations.filter(l => l.side === "long").length;
  const shortLiquidations = liquidations.filter(l => l.side === "short").length;

  const direction = longLiquidations > shortLiquidations ? "long" : "short";
  
  // A long liquidation cascade is bearish for price, and a short cascade is bullish.
  const signal = direction === "long" ? "SELL" : "BUY";

  return {
    engine: "LiquidationCascade",
    signal,
    confidence: Math.min(1, totalValue / 2000000), // Confidence scales with cascade size
    weight: 0.3,
    reason: `A ${direction} liquidation cascade of over $${(totalValue/1000000).toFixed(1)}M was detected.`,
    timestamp: Date.now()
  }
}
