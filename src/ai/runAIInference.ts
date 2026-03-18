
'use server';

import { z } from 'zod';
import { openai } from '@/lib/openai';
import { buildFeatureVector } from './buildFeatures';
import { AIBiasOutputSchema } from '@/intelligence/schemas';
import type { AIBiasOutput } from '@/intelligence/schemas';

const promptTemplate = `You are an expert crypto quantitative analyst. Your task is to analyze a feature vector representing the current state of the Bitcoin market and provide a trading decision in JSON format.

    **Market Features:**
    - Orderbook Imbalance: {{orderbookImbalance}} (-1 sell heavy, 1 buy heavy)
    - Liquidation Pressure: {{liquidationPressure}} (0-1, normalized recent liquidations)
    - Funding Pressure: {{fundingPressure}} (Raw funding rate. Positive = longs pay shorts, suggests overheated longs (bearish). Negative = shorts pay longs, suggests overheated shorts (bullish).)
    - OI Momentum: {{oiMomentum}} (% change in Open Interest. Rising OI with rising price is bullish continuation. Rising OI with falling price is bearish continuation. Falling OI suggests trend exhaustion.)
    - Volatility: {{volatility}} (0-100 score. High volatility increases risk.)
    - Price Momentum: {{priceMomentum}} (% change in price. Positive = bullish momentum.)

    Based on this data, determine your market bias, confidence, trade direction, and reasoning.
    The JSON output must conform to this Zod schema:
    const AIBiasOutputSchema = z.object({
      aiBias: z.enum(['Bullish', 'Bearish', 'Neutral']),
      confidence: z.number().min(0).max(1),
      tradeDirection: z.enum(['LONG', 'SHORT', 'HOLD']),
      reasoning: z.string()
    });
    `;

export async function runAIInference(): Promise<AIBiasOutput | null> {
    if (!openai) {
      console.warn("[AIInference] OpenAI client is not initialized, skipping AI inference.");
      return null;
    }

    try {
        console.log('[AIInference] Building feature vector...');
        const featureVector = await buildFeatureVector();
        console.log('[AIInference] Running AI inference with feature vector:', featureVector);

        const prompt = promptTemplate
          .replace('{{orderbookImbalance}}', String(featureVector.orderbookImbalance))
          .replace('{{liquidationPressure}}', String(featureVector.liquidationPressure))
          .replace('{{fundingPressure}}', String(featureVector.fundingPressure))
          .replace('{{oiMomentum}}', String(featureVector.oiMomentum))
          .replace('{{volatility}}', String(featureVector.volatility))
          .replace('{{priceMomentum}}', String(featureVector.priceMomentum));
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a professional trading analyst that only responds with valid JSON." },
                { role: "user", content: prompt },
            ],
            temperature: 0.2,
            response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            console.warn('[AIInference] OpenAI returned empty content.');
            return null;
        }
        
        const result = AIBiasOutputSchema.parse(JSON.parse(content));

        console.log('[AIInference] AI Inference complete. Result:', result);
        return result;
    } catch (err) {
        console.error('[AIInference] AI inference failed:', err);
        return null;
    }
}
