
import { z } from 'zod';
import {
    TradeScenarioSchema,
    type IntelligenceSnapshot
} from '@/intelligence/schemas';
import { formatPrice } from '@/lib/priceFormatter';

const TradeScenariosOutputSchema = z.object({
    scenarios: z.array(TradeScenarioSchema).max(3).describe("An array of 1 to 3 plausible trade scenarios."),
});

/**
 * Generates concrete trade scenarios based on the fully enriched snapshot.
 * It reads the high-level context and proposes actionable plans.
 * @param snapshot The fully enriched IntelligenceSnapshot.
 * @returns An array of TradeScenario objects.
 */
function generateDeterministicScenarios(
    snapshot: Partial<IntelligenceSnapshot>
): z.infer<typeof TradeScenariosOutputSchema>['scenarios'] {
    
    const { signalConfidence, tacticalContext, marketStructure, liquidityMap, orderBlocks } = snapshot;

    if (!signalConfidence || !tacticalContext || !marketStructure || !liquidityMap || !orderBlocks) {
         console.warn("[TradeScenarioEngine] Critical input data is missing. Cannot generate deterministic scenarios.");
         return [];
    }
    
    if (tacticalContext.environment === 'NO_TRADE_ZONE') {
        return [];
    }

    if (signalConfidence.dominantBias === 'Neutral' || signalConfidence.finalConfidence < 0.7) {
        return [{
            scenario: 'HOLD_AND_MONITOR',
            probability: 1 - (signalConfidence.finalConfidence),
            rationale: 'Market conditions are uncertain or signal confidence is below the minimum threshold. No high-probability trade setup is currently identifiable.'
        }];
    }

    if (tacticalContext.environment === 'BREAKOUT_ENVIRONMENT') {
        const scenarioType = signalConfidence.dominantBias === 'Bullish' ? 'BREAKOUT_LONG' : 'BREAKOUT_SHORT';
        const target = signalConfidence.dominantBias === 'Bullish' ? liquidityMap?.liquidityAbove : liquidityMap?.liquidityBelow;
        const stop = signalConfidence.dominantBias === 'Bullish' ? marketStructure.lastLow?.price : marketStructure.lastHigh?.price;
        const entry = signalConfidence.dominantBias === 'Bullish' ? marketStructure.lastHigh?.price : marketStructure.lastLow?.price;

        if (!target || !stop || !entry) return [];

        return [{
            scenario: scenarioType,
            probability: signalConfidence.finalConfidence,
            entry,
            stopLoss: stop,
            target,
            rationale: `A ${scenarioType.toLowerCase().replace('_', ' ')} is anticipated as price breaks key structure at ${formatPrice(entry)}. The primary target is the liquidity pool at ${formatPrice(target)}.`
        }];
    }
    
    if (tacticalContext.environment === 'TREND_CONTINUATION') {
        const scenarioType = signalConfidence.dominantBias === 'Bullish' ? 'TREND_PULLBACK_LONG' : 'TREND_PULLBACK_SHORT';
        const ob = signalConfidence.dominantBias === 'Bullish' ? orderBlocks.bullish?.[0] : orderBlocks.bearish?.[0];
        const entry = ob ? (ob.priceRange[0] + ob.priceRange[1]) / 2 : undefined;
        const stop = signalConfidence.dominantBias === 'Bullish' ? marketStructure.lastLow?.price : marketStructure.lastHigh?.price;
        const target = signalConfidence.dominantBias === 'Bullish' ? liquidityMap?.liquidityAbove : liquidityMap?.liquidityBelow;
        
        if (!stop || !target) return [];

        return [{
            scenario: scenarioType,
            probability: signalConfidence.finalConfidence,
            entry,
            stopLoss: stop,
            target,
            rationale: `Expecting a pullback to the nearest demand zone before continuing the ${signalConfidence.dominantBias.toLowerCase()} trend. Targeting liquidity at ${formatPrice(target)}.`
        }]
    }

    if (tacticalContext.environment === 'RANGE_ENVIRONMENT') {
        const scenarioType = signalConfidence.dominantBias === 'Bullish' ? 'RANGE_LOW_LONG' : 'RANGE_HIGH_SHORT';
        const entry = signalConfidence.dominantBias === 'Bullish' ? liquidityMap.liquidityBelow : liquidityMap.liquidityAbove;
        const stop = signalConfidence.dominantBias === 'Bullish' ? (entry * 0.995) : (entry * 1.005);
        const target = (marketStructure.lastHigh?.price && marketStructure.lastLow?.price) ? (marketStructure.lastHigh.price + marketStructure.lastLow.price) / 2 : undefined;

        if (!target) return [];
        
        return [{
            scenario: scenarioType,
            probability: signalConfidence.finalConfidence,
            entry,
            stopLoss: stop,
            target,
            rationale: `Fading the range extremes. A mean reversion trade is expected from the ${formatPrice(entry)} level towards the range midpoint.`
        }];
    }

    return [];
}


export async function generateScenarios(
    snapshot: Partial<IntelligenceSnapshot>
): Promise<z.infer<typeof TradeScenariosOutputSchema>['scenarios']> {

    try {
        const scenarios = generateDeterministicScenarios(snapshot);
        
        if (!scenarios || scenarios.length === 0) {
            const fallbackScenario: z.infer<typeof TradeScenarioSchema> = {
                scenario: 'FALLBACK_NEUTRAL',
                probability: 0.5,
                rationale: 'Deterministic scenario engine did not produce a valid trade. Market is likely in a non-ideal state for defined patterns.',
            };
            return [fallbackScenario];
        }

        // Sort scenarios by probability, descending
        return scenarios.sort((a, b) => b.probability - a.probability);

    } catch(error) {
        console.error('[TradeScenarioEngine] Deterministic execution failed:', error);
        const fallbackScenario: z.infer<typeof TradeScenarioSchema> = {
            scenario: 'FALLBACK_ERROR',
            probability: 0.5,
            rationale: 'The deterministic scenario generator failed to return a valid response. Proceed with caution.',
        };
        return [fallbackScenario];
    }
}
