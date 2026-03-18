
import type { IntelligenceSnapshot, ProbabilityForecast } from '../schemas';

export async function calculateProbabilityForecast(snapshot: Partial<IntelligenceSnapshot>): Promise<ProbabilityForecast> {
  let score = 0.5; // Base probability for a long position

  if (!snapshot.marketStructure || !snapshot.marketSentiment || !snapshot.timeframeAlignment) {
      return { tradeProbability: 0.5, probabilityLong: 0.5, probabilityShort: 0.5 };
  }

  // Market Structure
  if (snapshot.marketStructure.trend === 'bullish') score += 0.1;
  if (snapshot.marketStructure.trend === 'bearish') score -= 0.1;

  // Market Sentiment
  if (snapshot.marketSentiment.sentiment === 'bullish') score += 0.05 * snapshot.marketSentiment.confidence;
  if (snapshot.marketSentiment.sentiment === 'bearish') score -= 0.05 * snapshot.marketSentiment.confidence;

  // Timeframe Alignment
  if (snapshot.timeframeAlignment.alignment === 'bullish') score += 0.15 * snapshot.timeframeAlignment.strength;
  if (snapshot.timeframeAlignment.alignment === 'bearish') score -= 0.15 * snapshot.timeframeAlignment.strength;
  
  // Smart Money Footprint
  if (snapshot.smartMoney) {
      if (snapshot.smartMoney.activity === 'accumulation' || snapshot.smartMoney.activity === 'absorption') {
          score += 0.12 * snapshot.smartMoney.strength;
      }
      if (snapshot.smartMoney.activity === 'distribution') {
          score -= 0.12 * snapshot.smartMoney.strength;
      }
  }

  // Whale Intelligence
  if (snapshot.whaleIntelligence) {
      if (snapshot.whaleIntelligence.dominantActivity === 'exchange_outflow') { // Accumulation
          score += 0.10 * snapshot.whaleIntelligence.strength;
      }
      if (snapshot.whaleIntelligence.dominantActivity === 'exchange_inflow') { // Selling
          score -= 0.10 * snapshot.whaleIntelligence.strength;
      }
  }

  // Historical Analysis
  if (snapshot.historicalAnalysis) {
      const histProb = (snapshot.historicalAnalysis.outcomeProbability ?? 0) / 100;
      if (snapshot.historicalAnalysis.expectedOutcome.toLowerCase().includes('bullish')) {
        score += 0.1 * histProb;
      }
      if (snapshot.historicalAnalysis.expectedOutcome.toLowerCase().includes('bearish')) {
        score -= 0.1 * histProb;
      }
  }
  
  const probabilityLong = Math.max(0.15, Math.min(0.85, score));
  const probabilityShort = 1 - probabilityLong;

  const tradeProbability = probabilityLong;

  return {
    tradeProbability: parseFloat(tradeProbability.toFixed(2)),
    probabilityLong: parseFloat(probabilityLong.toFixed(2)),
    probabilityShort: parseFloat(probabilityShort.toFixed(2)),
  };
}
