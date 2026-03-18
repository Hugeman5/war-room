
import type { EngineResult } from '@/engines/types/Engine';

export function runOrderbookImbalanceEngine(orderbook: any): EngineResult {

  const neutralResult: EngineResult = {
    engine: "OrderbookImbalance",
    signal: "NEUTRAL",
    confidence: 0,
    weight: 0,
    timestamp: Date.now()
  };

  if (!orderbook) {
    return neutralResult;
  }

  const bids = orderbook?.bids ?? []
  const asks = orderbook?.asks ?? []

  const bidVolume = bids.reduce((sum: number, b: any) => sum + Number(b[1]), 0)
  const askVolume = asks.reduce((sum: number, a: any) => sum + Number(a[1]), 0)

  const total = bidVolume + askVolume

  if (total === 0) {
    return neutralResult;
  }

  const imbalance = (bidVolume - askVolume) / total

  if (imbalance > 0.15) {
    return {
      engine: "OrderbookImbalance",
      signal: "BUY",
      confidence: Math.min(1, imbalance * 2),
      weight: 0.2,
      reason: `Buy-side pressure detected with ${Math.round(imbalance * 100)}% imbalance.`,
      timestamp: Date.now()
    }
  }
  if (imbalance < -0.15) {
     return {
      engine: "OrderbookImbalance",
      signal: "SELL",
      confidence: Math.min(1, Math.abs(imbalance) * 2),
      weight: 0.2,
      reason: `Sell-side pressure detected with ${Math.round(Math.abs(imbalance) * 100)}% imbalance.`,
      timestamp: Date.now()
    }
  }

  return neutralResult;
}
