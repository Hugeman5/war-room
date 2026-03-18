
import type { FullSnapshot, SignalConfidence } from '@/intelligence/schemas';

// Weights for different signals.
// AI Inference gets a heavy weight (60%).
// Deterministic and Alpha engines share the remaining 40%.
const WEIGHTS = {
  // Deterministic & Alpha Engines (40% of total weight)
  marketStructure: 0.063,
  liquidityMap: 0.042,
  liquidationHeatmap: 0.042,
  smartMoney: 0.034,
  whaleIntelligence: 0.021,
  timeframeAlignment: 0.034,
  historicalAnalysis: 0.021,
  probabilityForecast: 0.021,
  marketSentiment: 0.021,
  macroEvents: 0.038,
  alphaLayer: 0.063,
  
  // AI Inference Engine (60% of total weight)
  aiInference: 0.6,
};

/**
 * Reads all base intelligence signals from the snapshot and fuses them into a
 * single directional bias and confidence score. This acts as the central
 * aggregator for all signal intelligence.
 * @param snapshot The current, partially-filled IntelligenceSnapshot.
 * @returns A SignalConfidence object.
 */
export async function aggregateIntelligence(snapshot: Partial<FullSnapshot>): Promise<SignalConfidence> {
  let longScore = 0;
  let shortScore = 0;

  // The engine now trusts that the snapshot contains the necessary data.
  // The orchestrator is responsible for ensuring this.
  
  // Market Structure
  if (snapshot.marketStructure?.trend === 'bullish') longScore += WEIGHTS.marketStructure;
  if (snapshot.marketStructure?.trend === 'bearish') shortScore += WEIGHTS.marketStructure;

  // Liquidity Map (targeting a pool is a signal)
  if (snapshot.liquidityMap?.nearestPool === 'above') longScore += WEIGHTS.liquidityMap * (snapshot.liquidityMap.sweepProbability ?? 0);
  if (snapshot.liquidityMap?.nearestPool === 'below') shortScore += WEIGHTS.liquidityMap * (snapshot.liquidityMap.sweepProbability ?? 0);

  // Liquidation Heatmap
  if (snapshot.liquidationHeatmap) {
    const totalShortLiq = snapshot.liquidationHeatmap.shortLiquidations.reduce((sum, l) => sum + l.size, 0);
    const totalLongLiq = snapshot.liquidationHeatmap.longLiquidations.reduce((sum, l) => sum + l.size, 0);
    const totalLiq = totalShortLiq + totalLongLiq;
    if (totalLiq > 0) {
      longScore += WEIGHTS.liquidationHeatmap * (totalShortLiq / totalLiq);
      shortScore += WEIGHTS.liquidationHeatmap * (totalLongLiq / totalLiq);
    }
  }

  // Smart Money
  if (snapshot.smartMoney?.activity === 'accumulation' || snapshot.smartMoney?.activity === 'absorption') longScore += WEIGHTS.smartMoney * (snapshot.smartMoney.strength ?? 0);
  if (snapshot.smartMoney?.activity === 'distribution') shortScore += WEIGHTS.smartMoney * (snapshot.smartMoney.strength ?? 0);
  
  // Whale Intelligence
  if (snapshot.whaleIntelligence) {
    if (snapshot.whaleIntelligence.dominantActivity === 'exchange_outflow') { // Accumulation
        longScore += WEIGHTS.whaleIntelligence * snapshot.whaleIntelligence.strength;
    }
    if (snapshot.whaleIntelligence.dominantActivity === 'exchange_inflow') { // Selling
        shortScore += WEIGHTS.whaleIntelligence * snapshot.whaleIntelligence.strength;
    }
  }

  // Market Sentiment
  if (snapshot.marketSentiment) {
    if (snapshot.marketSentiment.sentiment === 'bullish') {
      longScore += WEIGHTS.marketSentiment * snapshot.marketSentiment.confidence;
    }
    if (snapshot.marketSentiment.sentiment === 'bearish') {
      shortScore += WEIGHTS.marketSentiment * snapshot.marketSentiment.confidence;
    }
  }

  // Macro Events
  if (snapshot.macroEvents) {
    if (snapshot.macroEvents.direction === 'BULLISH_BTC') {
      longScore += WEIGHTS.macroEvents * (snapshot.macroEvents.impactLevel === 'HIGH' ? 1 : 0.5);
    }
    if (snapshot.macroEvents.direction === 'BEARISH_BTC') {
      shortScore += WEIGHTS.macroEvents * (snapshot.macroEvents.impactLevel === 'HIGH' ? 1 : 0.5);
    }
  }

  // Timeframe Alignment
  if (snapshot.timeframeAlignment?.alignment === 'bullish') longScore += WEIGHTS.timeframeAlignment * (snapshot.timeframeAlignment.strength ?? 0);
  if (snapshot.timeframeAlignment?.alignment === 'bearish') shortScore += WEIGHTS.timeframeAlignment * (snapshot.timeframeAlignment.strength ?? 0);

  // Historical Analysis
  if (snapshot.historicalAnalysis?.expectedOutcome.toLowerCase().includes('bullish')) longScore += WEIGHTS.historicalAnalysis * ((snapshot.historicalAnalysis.outcomeProbability ?? 0) / 100);
  if (snapshot.historicalAnalysis?.expectedOutcome.toLowerCase().includes('bearish')) shortScore += WEIGHTS.historicalAnalysis * ((snapshot.historicalAnalysis.outcomeProbability ?? 0) / 100);

  // Probability Forecast
  if (snapshot.probabilityForecast) {
    longScore += WEIGHTS.probabilityForecast * (snapshot.probabilityForecast.probabilityLong ?? snapshot.probabilityForecast.tradeProbability ?? 0);
    shortScore += WEIGHTS.probabilityForecast * (snapshot.probabilityForecast.probabilityShort ?? (1 - (snapshot.probabilityForecast.tradeProbability ?? 1)));
  }

  // --- AI Inference Signal ---
  if (snapshot.aiInference && snapshot.systemStatus?.aiInferenceEngine === 'ACTIVE') {
      const { aiBias, confidence } = snapshot.aiInference;
      if (aiBias === 'Bullish') {
          longScore += WEIGHTS.aiInference * confidence;
      }
      if (aiBias === 'Bearish') {
          shortScore += WEIGHTS.aiInference * confidence;
      }
  }

  // --- Alpha Layer Adjustment ---
  const alphaScore = snapshot.alphaLayer?.alphaScore;
  if (alphaScore !== undefined) {
    const alphaWeight = WEIGHTS.alphaLayer;
    if (alphaScore > 0) {
      longScore += alphaWeight * alphaScore;
    } else {
      shortScore += alphaWeight * Math.abs(alphaScore);
    }
  }

  const totalScore = longScore + shortScore;
  const longConfidence = totalScore > 0 ? longScore / totalScore : 0.5;
  const shortConfidence = totalScore > 0 ? shortScore / totalScore : 0.5;

  let dominantBias: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
  let finalConfidence = 0.5;

  if (longConfidence > 0.6) {
      dominantBias = 'Bullish';
      finalConfidence = longConfidence;
  } else if (shortConfidence > 0.6) {
      dominantBias = 'Bearish';
      finalConfidence = shortConfidence;
  } else {
      finalConfidence = 1 - Math.abs(longConfidence - shortConfidence);
  }

  return {
    longConfidence,
    shortConfidence,
    finalConfidence,
    dominantBias,
  };
}
