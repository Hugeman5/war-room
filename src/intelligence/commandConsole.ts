import type { IntelligenceSnapshot } from './schemas';
import type { CommandConsoleOutput } from './schemas';
import { formatPrice } from '@/lib/priceFormatter';

export function runCommandConsole(snapshot: Partial<IntelligenceSnapshot>): CommandConsoleOutput {
  const { marketStructure, liquidityMap, historicalAnalysis } = snapshot;

  // 1. Signal Scoring
  let structureScore = 0;
  let structureReason = 'Neutral';
  if (marketStructure) {
    if (marketStructure.trend === 'bullish') {
      structureScore = 2;
      structureReason = 'Bull Trend';
    } else if (marketStructure.trend === 'bearish') {
      structureScore = -2;
      structureReason = 'Bear Trend';
    }
  }

  let liquidityScore = 0;
  let liquidityReason = 'None';
  // A high probability of sweeping liquidity ABOVE price (buy-side) is a BULLISH signal (+1).
  // A high probability of sweeping liquidity BELOW price (sell-side) is a BEARISH signal (-1).
  if (liquidityMap) {
    if (liquidityMap.nearestPool === 'above' && liquidityMap.sweepProbability > 0.5) {
      liquidityScore = 1;
      liquidityReason = 'Targeting Buy-Side Liquidity';
    } else if (liquidityMap.nearestPool === 'below' && liquidityMap.sweepProbability > 0.5) {
      liquidityScore = -1;
      liquidityReason = 'Targeting Sell-Side Liquidity';
    }
  }

  let historicalScore = 0;
  let historicalReason = 'Neutral';
  if (historicalAnalysis) {
    if (historicalAnalysis.outcomeProbability > 60) {
      if (historicalAnalysis.expectedOutcome.toLowerCase().includes('bullish') || historicalAnalysis.expectedOutcome.toLowerCase().includes('upward')) {
        historicalScore = 2;
        historicalReason = 'Bullish Analogue';
      } else if (historicalAnalysis.expectedOutcome.toLowerCase().includes('bearish') || historicalAnalysis.expectedOutcome.toLowerCase().includes('downward')) {
        historicalScore = -2;
        historicalReason = 'Bearish Analogue';
      }
    }
  }

  // 2. Calculate Total Score
  const totalScore = structureScore + liquidityScore + historicalScore;

  // 3. Determine Market Bias
  let marketBias: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
  if (totalScore >= 3) marketBias = 'Bullish';
  if (totalScore <= -3) marketBias = 'Bearish';

  // 4. Calculate Confidence
  const signals = [structureScore, liquidityScore, historicalScore].filter(s => s !== 0);
  const agreeingSignals = signals.filter(s => (marketBias === 'Bullish' ? s > 0 : s < 0)).length;
  let confidence = signals.length > 0 ? Math.round((agreeingSignals / signals.length) * 100) : 50;

  if (marketBias === 'Neutral') confidence = Math.max(30, 100 - (Math.abs(totalScore) * 25));


  // 5. Scenarios & Invalidation
  let primaryScenario = 'The market is likely to remain in a consolidation range. A clear directional trigger is needed.';
  let alternativeScenario = 'A sharp breakout in either direction could occur if new volume enters the market.';
  let invalidationLevel = `Bias is invalidated if price breaks convincingly above the last high or below the last low.`;

  if (marketStructure && marketStructure.lastHigh && marketStructure.lastLow) {
    invalidationLevel = `Bias is invalidated if price breaks convincingly above ${formatPrice(marketStructure.lastHigh?.price)} or below ${formatPrice(marketStructure.lastLow?.price)}.`;

    if (marketBias === 'Bullish') {
      primaryScenario = `A bullish continuation is expected, likely targeting resistance levels above ${formatPrice(marketStructure.lastHigh?.price)}. This is supported by market structure and historical data.`;
      alternativeScenario = `Failure to break resistance could lead to a retest of support near ${formatPrice(marketStructure.lastLow?.price)}.`;
      invalidationLevel = `The bullish bias is invalidated if the price breaks and holds below the last major low at ${formatPrice(marketStructure.lastLow?.price)}.`;
    } else if (marketBias === 'Bearish') {
      primaryScenario = `A bearish continuation is expected, likely targeting support levels below ${formatPrice(marketStructure.lastLow?.price)}. This is supported by market structure and historical data.`;
      alternativeScenario = `A failure to break support could lead to a short squeeze rally towards resistance at ${formatPrice(marketStructure.lastHigh?.price)}.`;
      invalidationLevel = `The bearish bias is invalidated if the price breaks and holds above the last major high at ${formatPrice(marketStructure.lastHigh?.price)}.`;
    }
  }
  
  const signalBreakdown = {
    'Market Structure': { score: structureScore, reason: structureReason },
    'LIQUIDITY': { score: liquidityScore, reason: liquidityReason },
    'Historical': { score: historicalScore, reason: historicalReason },
  };

  return {
    marketBias,
    confidence,
    totalScore,
    primaryScenario,
    alternativeScenario,
    invalidationLevel,
    signalBreakdown,
  };
}
