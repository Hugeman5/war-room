

import type { IntelligenceSnapshot, RiskEnvironment } from '@/intelligence/schemas';
import type { RiskLevel, TradeMode } from '@/types/engineTypes';

/**
 * Reads macro and volatility data from the snapshot to assess the overall risk
 * environment and determine the appropriate trading mode.
 * @param snapshot The current, partially-filled IntelligenceSnapshot.
 * @returns A RiskEnvironment object.
 */
export async function assessRisk(snapshot: Partial<IntelligenceSnapshot>): Promise<RiskEnvironment> {
    const { macroEvents, marketRegime } = snapshot;

    if (!macroEvents || !marketRegime) {
        console.warn("[RiskEnvironmentEngine] Critical input data is missing. Returning default state.");
        return {
            riskLevel: 'MODERATE',
            tradeMode: 'DEFENSIVE',
            recommendedPositionSize: 0.5,
            notes: 'Risk assessment pending due to missing data.',
        };
    }

    // Highest priority: HALT on high-risk macro events
    if (macroEvents.macroRisk === 'HIGH') {
        return {
            riskLevel: 'HIGH',
            tradeMode: 'HALTED',
            recommendedPositionSize: 0,
            notes: `High impact macro event upcoming: ${macroEvents.event}. Trading is halted.`,
        };
    }

    // Default to LOW risk, NORMAL mode
    let riskLevel: RiskLevel = 'LOW';
    let tradeMode: TradeMode = 'NORMAL';
    let recommendedPositionSize = 1.0;
    let notes = 'Market conditions appear stable.';

    // Check for conditions that warrant MODERATE risk and DEFENSIVE mode
    if (macroEvents.macroRisk === 'MODERATE') {
        riskLevel = 'MODERATE';
        tradeMode = 'DEFENSIVE';
        recommendedPositionSize = 0.5;
        notes = 'Moderate risk from upcoming macro events. Reduce position size.';
    } else if (macroEvents.riskDirection === 'RISK_OFF') {
        riskLevel = 'MODERATE';
        tradeMode = 'DEFENSIVE';
        recommendedPositionSize = 0.5;
        notes = 'Macro environment is RISK-OFF. Adopting a defensive posture.';
    } else if (marketRegime.volatilityState === 'EXPANDING') {
        riskLevel = 'MODERATE';
        tradeMode = 'DEFENSIVE';
        recommendedPositionSize = 0.5;
        notes = 'Volatility is expanding. Trade with caution and smaller size.';
    }

    // A breakout regime can elevate risk to MODERATE and overwrites previous notes.
    if (marketRegime.regime === 'BREAKOUT') {
        if (riskLevel === 'LOW') {
            riskLevel = 'MODERATE';
            tradeMode = 'DEFENSIVE';
            recommendedPositionSize = 0.5;
        }
        notes = 'Breakout environment detected. Increased risk of fakeouts.';
    }
    
    return {
        riskLevel,
        tradeMode,
        recommendedPositionSize,
        notes,
    };
}
