

import type { IntelligenceSnapshot, StrategyOutput } from '@/intelligence/schemas';
import { formatPrice } from '@/lib/priceFormatter';


function calculateRiskManagement(entry: number, stop: number, portfolioSize: number, riskPercent: number) {
    if (!entry || !stop || entry === stop) return {};
    const stopDistance = Math.abs(entry - stop);
    const stopDistancePercent = (stopDistance / entry) * 100;
    const maxRisk = portfolioSize * (riskPercent / 100);
    const positionSize = maxRisk / stopDistance;
    const capitalExposure = positionSize * entry;
    return {
        positionSize: `${positionSize.toFixed(4)} BTC`,
        maxRisk: formatPrice(maxRisk),
        stopDistance: `${stopDistancePercent.toFixed(2)}%`,
        capitalExposure: formatPrice(capitalExposure),
    };
}

/**
 * The final stage of the pipeline. It consumes the complete, enriched snapshot and
 * assembles the final, actionable trade plan (StrategyOutput).
 * @param snapshot The fully-enriched IntelligenceSnapshot.
 * @returns A StrategyOutput object or null if no valid trade can be constructed.
 */
export async function assembleStrategy(
  snapshot: Partial<IntelligenceSnapshot>,
): Promise<StrategyOutput | null> {

    const { 
        signalConfidence,
        riskEnvironment,
        masterAIBrainOutput,
        tradeScenarios,
        timestamp: snapshotTimestamp 
    } = snapshot;

    if (!signalConfidence || !riskEnvironment || !masterAIBrainOutput || !tradeScenarios) {
        console.warn("[Strategy Engine] Skipping run due to missing intelligence data from the snapshot.");
        return null;
    }
    
    if (masterAIBrainOutput.status === 'HALTED') {
         return {
            bias: 'Neutral',
            confidence: 0,
            strategyNotes: `Trading HALTED by AI Risk Environment Engine: ${riskEnvironment.notes}`,
            bullProbability: 0.5, bearProbability: 0.5, consolidationProbability: 1, breakoutProbability: 0,
            aiBrokerStatus: 'DISABLED',
            timestamp: snapshotTimestamp ?? Date.now(),
        };
    }
    
    if (masterAIBrainOutput.status === 'NO_SETUP' || tradeScenarios.length === 0) {
        return {
            bias: 'Neutral',
            confidence: Math.round(masterAIBrainOutput.confidence * 100),
            strategyNotes: masterAIBrainOutput.commentary,
            bullProbability: signalConfidence.longConfidence, bearProbability: signalConfidence.shortConfidence, consolidationProbability: 1, breakoutProbability: 0,
            aiBrokerStatus: 'DISABLED',
            timestamp: snapshotTimestamp ?? Date.now(),
        };
    }
    
    const primaryScenario = tradeScenarios[0];
    const tradeBias = signalConfidence.dominantBias;
    const signalScore = Math.round(signalConfidence.finalConfidence * 100);

    const { entry, stopLoss, target, rationale } = primaryScenario;
    if (!entry || !stopLoss || !target) {
        return {
            bias: 'Neutral',
            confidence: signalScore,
            strategyNotes: "Primary scenario is missing critical entry, stop, or target values.",
            bullProbability: signalConfidence.longConfidence, bearProbability: signalConfidence.shortConfidence, consolidationProbability: 1, breakoutProbability: 0,
            timestamp: snapshotTimestamp ?? Date.now()
        };
    }

    const rr = Math.abs(target - entry) / Math.abs(entry - stopLoss);
    if (rr < 2) {
       return { 
           bias: 'Neutral', 
           confidence: signalScore, 
           strategyNotes: `Primary scenario rejected due to poor Risk/Reward Ratio: 1:${rr.toFixed(1)}. Minimum is 1:2.`,
           bullProbability: signalConfidence.longConfidence, bearProbability: signalConfidence.shortConfidence, consolidationProbability: 1, breakoutProbability: 0,
           timestamp: snapshotTimestamp ?? Date.now() 
        };
    }
    
    const riskMetrics = calculateRiskManagement(entry, stopLoss, 100000, 1);
    const tacticalEnv = snapshot.tacticalContext?.environment;
    const breakoutProbability = tacticalEnv === 'BREAKOUT_ENVIRONMENT' ? signalConfidence.finalConfidence : 0;
    const consolidationProbability = (tacticalEnv === 'RANGE_ENVIRONMENT' || tacticalEnv === 'NO_TRADE_ZONE') ? signalConfidence.finalConfidence : 0;

    const finalStrategy: StrategyOutput = {
        bias: tradeBias,
        confidence: signalScore,
        strategyNotes: rationale,
        entryZone: [entry * 0.999, entry * 1.001],
        stopLoss: stopLoss,
        targets: [target],
        riskRewardRatio: `1:${rr.toFixed(1)}`,
        ...riskMetrics,
        bullProbability: signalConfidence.longConfidence,
        bearProbability: signalConfidence.shortConfidence,
        consolidationProbability: consolidationProbability,
        breakoutProbability: breakoutProbability,
        aiDecision: masterAIBrainOutput.decision,
        aiCommentary: masterAIBrainOutput.commentary,
        aiBrokerStatus: 'ACTIVE',
        timestamp: snapshotTimestamp ?? Date.now(),
    }

    return finalStrategy;
}
