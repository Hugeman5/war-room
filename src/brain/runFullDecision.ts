'use server';

import { buildFeatureVector } from "@/ai/buildFeatures";
import { getAIAnalysis } from "./aiAnalysis";
import { canCallAI } from "./aiGuard";
import { runAlphaLayer } from "@/alpha/runAlphaLayer";
import { fetchNews } from "@/services/newsService";
import { scoreNewsSentiment } from "./newsSentiment";
import { computeConfidence } from "./computeConfidence";
import type { FullSnapshot } from "@/intelligence/schemas";
import type { FeatureVector } from "@/types/market";
import { normalizeBias } from "./normalizeBias";
import { shouldTrade } from "./tradeFilter";
import type { AIBiasOutput } from "@/intelligence/schemas";

let latestNewsScore = 0;
let latestAI: AIBiasOutput | null = null;
let backgroundTaskInterval: NodeJS.Timeout | null = null;

export function startBackgroundTasks() {
    if (backgroundTaskInterval) return;
    
    const updateBackgroundContext = async () => {
        try {
            const headlines = await fetchNews().catch(() => []);
            latestNewsScore = scoreNewsSentiment(headlines);

            if (canCallAI()) {
                const dummyFeatures = await buildFeatureVector().catch(() => ({}));
                latestAI = await getAIAnalysis({
                    features: dummyFeatures,
                    news: headlines,
                });
            }
        } catch (err) {
            console.error("Background task error:", err);
        }
    };

    updateBackgroundContext();
    backgroundTaskInterval = setInterval(updateBackgroundContext, 10000);
}

export async function runFullDecision(features?: FeatureVector): Promise<FullSnapshot> {
    const pipelineStartTime = performance.now();

    try {
        const pFeatures: FeatureVector = features ?? await buildFeatureVector();

        const quant = await runAlphaLayer();
        const newsScore = latestNewsScore;
        const ai = latestAI;
        
        const finalConfidence = computeConfidence(
            pFeatures,
            quant.alphaScore,
            newsScore,
            ai?.confidence
        );

        const quantBiasForNotes = quant.alphaScore > 0.1 ? 'Bullish' : quant.alphaScore < -0.1 ? 'Bearish' : 'Neutral';
        let finalBias: 'LONG' | 'SHORT' | 'Neutral' = quant.alphaScore > 0.1 ? 'LONG' : quant.alphaScore < -0.1 ? 'SHORT' : 'Neutral';

        if (ai && ai.confidence > 0.65) {
            if (ai.tradeDirection === 'HOLD') {
                finalBias = 'Neutral';
            } else {
                finalBias = ai.tradeDirection;
            }
        }
        
        let strategyNotes = ai ? ai.reasoning : `Quant-driven signal. Bias: ${quantBiasForNotes}. Alpha Score: ${quant.alphaScore.toFixed(2)}.`;
        if (!shouldTrade(finalConfidence)) {
            finalBias = 'Neutral';
            strategyNotes = `No trade signal. Confidence ${Math.round(finalConfidence * 100)}% is below the 60% threshold.`
        }
        
        const normalizedFinalBias = normalizeBias(finalBias) || 'Neutral';

        const resultForLogging = {
            bias: normalizedFinalBias,
            score: quant.alphaScore,
            confidence: finalConfidence,
            newsScore,
            ai,
        };
        console.log("--- FULL PIPELINE RESULT ---");
        console.log(JSON.stringify(resultForLogging, null, 2));
        console.log("--------------------------");

        return {
             timestamp: Date.now(),
             strategy: {
                 bias: normalizedFinalBias,
                 confidence: Math.round(finalConfidence * 100),
                 strategyNotes: strategyNotes,
                 bullProbability: (quant.alphaScore + 1) / 2,
                 bearProbability: 1 - ((quant.alphaScore + 1) / 2),
                 consolidationProbability: 1 - Math.abs(quant.alphaScore),
                 breakoutProbability: Math.abs(quant.alphaScore),
                 timestamp: Date.now(),
                 aiDecision: ai?.tradeDirection || (quantBiasForNotes === 'Bullish' ? 'LONG' : quantBiasForNotes === 'Bearish' ? 'SHORT' : 'HOLD'),
                 aiCommentary: ai?.reasoning
             },
             alphaLayer: quant,
             aiInference: ai || undefined,
             systemStatus: {
                 aiInferenceEngine: ai ? 'ACTIVE' : 'IDLE',
                 alphaLayer: 'ACTIVE'
             },
             engineLatencies: {
                 pipelineTotal: performance.now() - pipelineStartTime,
             }
        };

    } catch (err) {
        console.error("DECISION PIPELINE FAILURE", err);
        return {
             timestamp: Date.now(),
             strategy: {
                 bias: 'Neutral',
                 confidence: 0,
                 strategyNotes: 'Decision pipeline failed to execute.',
                 bullProbability: 0.5,
                 bearProbability: 0.5,
                 consolidationProbability: 1,
                 breakoutProbability: 0,
                 timestamp: Date.now(),
             },
             systemStatus: {
                 orchestrator: 'FAILED',
             },
             engineLatencies: {
                 pipelineTotal: performance.now() - pipelineStartTime,
             }
        } as FullSnapshot;
    }
}
