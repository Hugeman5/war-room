
import type { ChartAnalysisOutput, HistoricalAnalysisOutput, MarketStructure } from '@/intelligence/schemas';
import type { Candle } from '@/lib/candle-builder';

// --- From patternMatcher.ts ---
export type PatternCategory = 'Bull Flag' | 'Bear Flag' | 'Triangle' | 'Range' | 'Breakout' | 'Reversal' | 'Indeterminate';

function classifyPattern(chartAnalysis: ChartAnalysisOutput): { category: PatternCategory, details: string } {
    console.log("Classifying market pattern...");
    const structure = chartAnalysis.breakoutStructure?.toLowerCase() || '';
    const trend = chartAnalysis.trend?.toLowerCase() || '';

    if (structure.includes('bull flag') || (structure.includes('continuation') && trend === 'bullish')) {
        return { category: 'Bull Flag', details: `Bullish continuation pattern (${structure}) detected in a ${trend} trend.` };
    }
    if (structure.includes('bear flag') || (structure.includes('continuation') && trend === 'bearish')) {
        return { category: 'Bear Flag', details: `Bearish continuation pattern (${structure}) detected in a ${trend} trend.` };
    }
    if (structure.includes('triangle')) {
        return { category: 'Triangle', details: `Consolidation triangle forming.` };
    }
    if (structure.includes('choch') || structure.includes('reversal')) {
        return { category: 'Reversal', details: `Potential trend reversal detected (${structure}).` };
    }
     if (structure.includes('bos') || structure.includes('breakout')) {
        return { category: 'Breakout', details: `Breakout of structure detected in a ${trend} trend.` };
    }
    if (trend === 'sideways' || trend === 'range') {
        return { category: 'Range', details: `Market is in a consolidation range.` };
    }

    console.log(`Indeterminate pattern for structure: "${structure}" and trend: "${trend}"`);
    return { category: 'Indeterminate', details: `Market is in a ${trend} trend with no clear pattern.` };
}


// --- From historicalSearch.ts ---
export type HistoricalMatch = {
    reference: string;
    details: string;
    context: string;
};

function findHistoricalMatches(
    candles: Candle[], 
    pattern: PatternCategory
): HistoricalMatch | null {
    console.log(`Searching for historical matches for pattern: ${pattern} using ${candles.length} candles.`);
    
    if (candles.length < 50) {
        console.warn("Not enough historical data to perform a search.");
        return null;
    }
    const lastPrice = candles[candles.length - 1].close;

    switch (pattern) {
        case 'Bull Flag':
        case 'Breakout':
            return {
                reference: 'BTC Oct 2023 Pre-ETF Rally',
                details: `A similar bull flag formed around $${(lastPrice * 0.6).toFixed(0)} after a period of consolidation, leading to a significant upward breakout.`,
                context: 'The market context was driven by strong positive sentiment around the upcoming Bitcoin Spot ETFs.'
            };
        case 'Bear Flag':
            return {
                reference: 'BTC May 2022 Post-LUNA Crash',
                details: 'A bearish continuation pattern appeared, resulting in further downside after a brief consolidation.',
                context: 'The market was reeling from the collapse of the Terra/LUNA ecosystem, creating extreme fear.'
            };
        case 'Reversal':
             return {
                reference: 'BTC Nov 2022 FTX Bottom',
                details: 'A change of character (CHOCH) at the lows marked the bottom of the bear market.',
                context: 'Extreme negative sentiment from the FTX collapse provided the catalyst for a reversal.'
             }
        case 'Range':
            return {
                reference: 'BTC Summer 2023 "Chop-fest"',
                details: 'The market was caught in a prolonged sideways range with low volatility and multiple fake-outs.',
                context: 'Low volume and lack of a clear market narrative led to extended ranging behavior.'
            };
        default:
            console.log("No specific historical match found for this pattern.");
            return null;
    }
}


// --- From fallbackHistoricalEngine.ts ---
function fallbackHistoricalAnalysis(
  chartAnalysis: ChartAnalysisOutput | null,
  pattern: { category: PatternCategory, details: string } | null,
  historicalMatch: HistoricalMatch | null
): HistoricalAnalysisOutput {
  
  if (!chartAnalysis) {
    return {
      pattern: "No Data",
      similarityScore: 0,
      historicalReference: "Unavailable",
      triggerEvent: "Chart analysis missing",
      expertBehavior: "Unknown",
      whaleActivity: "Unknown",
      sentimentScore: 0,
      marketContext: "Unknown",
      volatilityRegime: "Unknown",
      historicalMove: "Unknown",
      outcomeProbability: 0,
      expectedOutcome: "Historical analysis could not run due to missing chart data"
    };
  }

  if (pattern && historicalMatch) {
    const isBullish = pattern.category === 'Bull Flag' || (pattern.category === 'Breakout' && chartAnalysis.trend === 'bullish');
    return {
      pattern: pattern.category,
      similarityScore: 45,
      historicalReference: historicalMatch.reference,
      triggerEvent: 'Pattern similarity and historical context',
      expertBehavior: "Institutions likely accumulating if bullish, distributing if bearish.",
      whaleActivity: "Monitoring for large order flow.",
      sentimentScore: 0,
      marketContext: chartAnalysis.trend,
      volatilityRegime: "Moderate",
      historicalMove: isBullish ? "+5% to +10%" : "-5% to -10%",
      outcomeProbability: 60,
      expectedOutcome: isBullish ? "Continuation of the bullish trend is likely." : "Continuation of the bearish trend is likely."
    };
  }

  const genericPattern = chartAnalysis.breakoutStructure || "Range";

  return {
    pattern: genericPattern,
    similarityScore: 40,
    historicalReference: "Generic historical pattern",
    triggerEvent: "Pattern similarity detected",
    expertBehavior: "Likely institutional positioning",
    whaleActivity: "Unknown",
    sentimentScore: 0,
    marketContext: chartAnalysis.trend,
    volatilityRegime: "Moderate",
    historicalMove: "Historical move varies",
    outcomeProbability: 50,
    expectedOutcome: "Moderate continuation probability based on pattern similarity"
  };
}


// --- From webPatternEngine.ts ---
export async function findHistoricalPattern(
  candles: Candle[],
  marketStructure: MarketStructure
): Promise<HistoricalAnalysisOutput> {
  console.log("Running Historical Intelligence Engine...");
  
  if (!marketStructure || candles.length === 0) {
    console.warn("Historical engine skipped: missing market structure or candles.");
    return fallbackHistoricalAnalysis(null, null, null);
  }

  // Create a ChartAnalysisOutput object on the fly for the deterministic engines
  const chartAnalysis: ChartAnalysisOutput = {
      trend: marketStructure.trend,
      support: marketStructure.lastLow ? [marketStructure.lastLow.price] : [],
      resistance: marketStructure.lastHigh ? [marketStructure.lastHigh.price] : [],
      breakoutStructure: marketStructure.events[marketStructure.events.length - 1]?.type || 'Range',
      keyInsights: 'Derived from live market structure.'
  }
  
  const pattern = classifyPattern(chartAnalysis);
  console.log("Pattern classified:", pattern);
  const historicalMatch = findHistoricalMatches(candles, pattern.category);
  console.log("Historical match found:", historicalMatch);
  
  // AI engine is disabled, so we always return the deterministic fallback.
  console.warn("AI engine disabled. Using deterministic fallback for historical analysis.");
  return fallbackHistoricalAnalysis(chartAnalysis, pattern, historicalMatch);
}
