

import type { IntelligenceSnapshot, TacticalContext } from '@/intelligence/schemas';

/**
 * Reads market regime and structure from the snapshot to determine the most
 * appropriate tactical approach (e.g., trend-following, mean-reversion).
 * @param snapshot The current, partially-filled IntelligenceSnapshot.
 * @returns A TacticalContext object.
 */
export async function determineTactics(snapshot: Partial<IntelligenceSnapshot>): Promise<TacticalContext> {
    const { marketRegime, timeframeAlignment, marketStructure } = snapshot;

    if (!marketRegime || !timeframeAlignment || !marketStructure) {
        console.warn("[TacticalContextEngine] Critical input data is missing. Returning default state.");
        return {
            environment: 'NO_TRADE_ZONE',
            rationale: 'Market conditions are unclear due to missing intelligence data.'
        };
    }

    if (marketRegime.regime === 'BREAKOUT') {
        return {
            environment: 'BREAKOUT_ENVIRONMENT',
            rationale: 'Market is showing signs of breaking out of its current range. Expect increased volatility.'
        };
    }
    
    if (marketRegime.regime === 'TRENDING' && (timeframeAlignment.alignment === 'bullish' || timeframeAlignment.alignment === 'bearish')) {
        return {
            environment: 'TREND_CONTINUATION',
            rationale: `Market is in a confirmed trend with timeframe alignment strength of ${((timeframeAlignment.strength ?? 0) * 100).toFixed(0)}%.`
        };
    }

    if (marketRegime.regime === 'RANGING' || marketRegime.regime === 'ACCUMULATION' || marketRegime.regime === 'DISTRIBUTION') {
        return {
            environment: 'RANGE_ENVIRONMENT',
            rationale: 'Market is consolidating within a defined range. Mean reversion strategies are favorable.'
        };
    }
    
    if (marketStructure.events.some(e => e.type === 'CHOCH')) {
        return {
            environment: 'REVERSAL_ENVIRONMENT',
            rationale: 'A recent Change of Character suggests a potential trend reversal is underway.'
        };
    }

    return {
        environment: 'NO_TRADE_ZONE',
        rationale: 'Market conditions are unclear and conflicting. Awaiting a clearer signal.'
    };
}
