import { FeatureVector } from "@/types/market";

let prevPrice = 0;
let priceHistory: number[] = [];
let buyVolume = 0;
let sellVolume = 0;

export function buildFeatureVector(tick: any): FeatureVector {
  const currentPrice = tick.price;
  
  // 1. REAL Momentum
  let priceMomentum = 0;
  if (prevPrice > 0) {
    priceMomentum = (currentPrice - prevPrice) / prevPrice;
  }
  prevPrice = currentPrice;

  // 2. Volatility (stdDev of last 20 prices)
  priceHistory.push(currentPrice);
  if (priceHistory.length > 20) {
    priceHistory.shift();
  }
  
  let volatility = 0;
  if (priceHistory.length === 20) {
    const mean = priceHistory.reduce((a, b) => a + b, 0) / 20;
    const sqDiffs = priceHistory.map(p => Math.pow(p - mean, 2));
    const variance = sqDiffs.reduce((a, b) => a + b, 0) / 20;
    volatility = Math.sqrt(variance);
  }

  // 3. Trade Pressure (buy vs sell volume)
  if (tick.isBuyerMaker !== undefined) {
    if (tick.isBuyerMaker) {
      sellVolume += tick.volume; // Maker was buyer, Taker was seller
    } else {
      buyVolume += tick.volume;  // Maker was seller, Taker was buyer
    }
  }

  // Decay volumes to keep a recent window representing "pressure"
  buyVolume *= 0.99;
  sellVolume *= 0.99;
  
  const tradePressure = buyVolume - sellVolume;

  return {
    orderbookImbalance: tradePressure, 
    liquidationPressure: 0,
    fundingPressure: 0,
    oiMomentum: 0,
    volatility: volatility, 
    priceMomentum: priceMomentum 
  };
}
