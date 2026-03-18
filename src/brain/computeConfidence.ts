
import { FeatureVector } from "@/types/market";

export function computeConfidence(
  features: FeatureVector,
  score: number,
  newsScore: number,
  aiConfidence?: number
): number {
  
  // Base confidence from score strength
  let confidence = Math.abs(score);

  // Momentum alignment boost
  if (
    Math.sign(score) === Math.sign(features.priceMomentum)
  ) {
    confidence += 0.1;
  }

  // Orderbook confirmation
  if (
    Math.sign(score) === Math.sign(features.orderbookImbalance)
  ) {
    confidence += 0.1;
  }

  // News alignment
  if (Math.sign(score) === Math.sign(newsScore)) {
    confidence += 0.1;
  }

  // AI boost (optional)
  if (aiConfidence) {
    confidence += aiConfidence * 0.2;
  }

  // Volatility penalty (choppy market)
  // The volatility feature is a 0-100 score, so we scale it to 0-1 for penalty calculation.
  confidence *= (1 - (features.volatility / 100) * 0.5);

  return Math.max(0, Math.min(1, confidence));
}
