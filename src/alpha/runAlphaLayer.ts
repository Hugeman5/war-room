
import { alphaRegistry } from './alphaRegistry';
import type { AlphaSignal, AlphaLayerOutput, AlphaSignalName } from './types';

const WEIGHTS: Record<AlphaSignalName, number> = {
    WhaleTracker: 0.3,
    LiquidationHeatmap: 0.25,
    FundingPressure: 0.2,
    OpenInterestShock: 0.1,
    OptionsGamma: 0.15,
};

export async function runAlphaLayer(): Promise<AlphaLayerOutput> {
    const signalPromises = alphaRegistry.map(async (engine) => {
        const result = await engine.run();
        return {
            name: engine.name,
            ...result,
        };
    });

    const signals = await Promise.all(signalPromises);

    let bullishScore = 0;
    let bearishScore = 0;

    for (const s of signals) {
        const weight = WEIGHTS[s.name];
        const weightedScore = s.strength * s.confidence * weight;

        if (s.signal === 'bullish') {
            bullishScore += weightedScore;
        } else if (s.signal === 'bearish') {
            bearishScore += weightedScore;
        }
    }

    const alphaScore = bullishScore - bearishScore; // A score from -1 to 1

    return {
        alphaScore,
        signals,
    };
}
