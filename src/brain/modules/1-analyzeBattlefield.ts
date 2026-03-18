

import type { IntelligenceSnapshot, BattlefieldState } from '@/intelligence/schemas';

/**
 * Reads the core market analysis from the snapshot and fuses it into a high-level
 * qualitative assessment of the current market state.
 * @param snapshot The current, partially-filled IntelligenceSnapshot.
 * @returns A BattlefieldState object.
 */
export async function analyzeBattlefield(snapshot: Partial<IntelligenceSnapshot>): Promise<BattlefieldState> {
    const { marketStructure, marketRegime, liquidityMap, smartMoney, liquidationHeatmap } = snapshot;

    if (!marketStructure || !marketRegime || !liquidityMap || !smartMoney || !liquidationHeatmap) {
        console.warn("[BattlefieldSituationEngine] Critical input data is missing. Returning default state.");
        return {
            marketState: 'Ranging',
            volatility: 'NORMAL',
            liquidityPosition: 'Between Levels',
            smartMoneyActivity: 'NONE',
            confidenceScore: 0.3,
        };
    }

    let marketState = 'Ranging';
    if (marketStructure.trend === 'bullish') marketState = 'Trending Up';
    if (marketStructure.trend === 'bearish') marketState = 'Trending Down';

    const volatility = marketRegime.volatilityState ?? 'NORMAL';
    
    let liquidityPosition = 'Between Levels';
    if (liquidityMap.nearestPool === 'above') {
        const nearestShortLiq = liquidationHeatmap.shortLiquidations?.length ? liquidationHeatmap.shortLiquidations[0].price : null;
        if(nearestShortLiq) {
            liquidityPosition = 'Approaching Short Liquidations';
        } else {
             liquidityPosition = 'Approaching Buyside Liquidity';
        }
    }
    if (liquidityMap.nearestPool === 'below') {
         const nearestLongLiq = liquidationHeatmap.longLiquidations?.length ? liquidationHeatmap.longLiquidations[0].price : null;
        if(nearestLongLiq) {
            liquidityPosition = 'Approaching Long Liquidations';
        } else {
            liquidityPosition = 'Approaching Sellside Liquidity';
        }
    }
    
    const smartMoneyActivity = smartMoney.activity?.toUpperCase() as BattlefieldState['smartMoneyActivity'] ?? 'NONE';

    // Simple confidence fusion
    const confidenceScore = (
        (marketRegime.confidence ?? 0) * 0.4 +
        (smartMoney.strength ?? 0) * 0.3 +
        (liquidityMap.sweepProbability ?? 0) * 0.3
    );

    return {
        marketState,
        volatility,
        liquidityPosition,
        smartMoneyActivity,
        confidenceScore: Math.min(1, confidenceScore),
    };
}
