import { FeatureVector } from "@/types/market";

function isAligned(val1: number, val2: number, threshold = 0.05): boolean {
  if (Math.abs(val1) <= threshold || Math.abs(val2) <= threshold) return false;
  return Math.sign(val1) === Math.sign(val2);
}

export function computeConfidence(
  features: FeatureVector,
  score: number,
  newsScore: number,
  aiConfidence?: number
): number {
  
  let confidence = Math.abs(score);
  const boostMagnitude = Math.abs(score) * 0.1; 

  if (isAligned(score, (features as any).priceMomentum || 0)) {
    confidence += boostMagnitude;
  }

  if (isAligned(score, (features as any).orderbookImbalance || 0)) {
    confidence += boostMagnitude;
  }

  if (isAligned(score, newsScore)) {
    confidence += boostMagnitude;
  }

  if (aiConfidence) {
    confidence += aiConfidence * 0.2;
  }

  const vol = Math.max(0, Math.min(1, features.volatility || 0));
  confidence *= (1 - vol * 0.5);

  return Math.max(0, Math.min(1, confidence));
}
