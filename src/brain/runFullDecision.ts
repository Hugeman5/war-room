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

/**
 * Runs the entire intelligence pipeline from data fetching to final strategy assembly.
 * This is the main orchestrator for the server-side intelligence generation.
 */
export async function runFullDecision(features?: FeatureVector): Promise<FullSnapshot> {
    console.log("PIPELINE STARTED (Full Final Form)");
    const pipelineStartTime = performance.now();

    try {
        const pFeatures: FeatureVector = features ?? await buildFeatureVector();

        // Run Quant Layer
        const quant = await runAlphaLayer();
        
        // NEWS (always available)
        const headlines = await fetchNews();
        const newsScore = scoreNewsSentiment(headlines);

        // AI (optional)
        let ai = null;
        if (canCallAI()) {
            console.log("Running AI analysis (getAIAnalysis)...");
            ai = await getAIAnalysis({
                features: pFeatures,
                news: headlines,
            });
        }
        
        // Compute Fused Confidence
        const finalConfidence = computeConfidence(
            pFeatures,
            quant.alphaScore,
            newsScore,
            ai?.confidence
        );

        // Determine Final Bias
        const quantBiasForNotes = quant.alphaScore > 0.1 ? 'Bullish' : quant.alphaScore < -0.1 ? 'Bearish' : 'Neutral';
        const quantBias = quant.alphaScore > 0.1 ? 'LONG' : quant.alphaScore < -0.1 ? 'SHORT' : 'Neutral';
        let finalBias: 'LONG' | 'SHORT' | 'Neutral' = quantBias;

        if (ai && ai.confidence > 0.65) {
            if (ai.tradeDirection === 'HOLD') {
                finalBias = 'Neutral';
            } else {
                finalBias = ai.tradeDirection;
            }
        }
        
        // Apply trade filter
        let strategyNotes = ai ? ai.reasoning : `Quant-driven signal. Bias: ${quantBiasForNotes}. Alpha Score: ${quant.alphaScore.toFixed(2)}.`;
        if (!shouldTrade(finalConfidence)) {
            finalBias = 'Neutral';
            strategyNotes = `No trade signal. Confidence ${Math.round(finalConfidence * 100)}% is below the 60% threshold.`
        }
        
        const normalizedFinalBias = normalizeBias(finalBias);

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

        // Create a basic snapshot for the UI from the test results
        const fullSnapshot: FullSnapshot = {
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
        }
        return fullSnapshot;

    } catch (err) {
        console.error("DECISION PIPELINE FAILURE", err);
        // Fallback in case of any failure
        const fullSnapshot: FullSnapshot = {
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
        }
        return fullSnapshot;
    }
}
