import { FeatureVector } from "@/types/market";

export function buildFeatureVector(tick: any): FeatureVector {
  return {
    orderbookImbalance: 0, // placeholder (next upgrade)
    liquidationPressure: 0,
    fundingPressure: 0,
    oiMomentum: 0,
    volatility: 0.2, // basic assumption for now
    priceMomentum: Math.random() * 2 - 1 // temporary
  };
}
