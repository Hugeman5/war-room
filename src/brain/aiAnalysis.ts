import { openai } from "@/lib/openai";
import { z } from 'zod';
import { AIBiasOutputSchema } from "@/intelligence/schemas";
import type { AIBiasOutput } from "@/intelligence/schemas";

export async function getAIAnalysis(input: {
  features: any;
  news?: string[];
}): Promise<AIBiasOutput | null> {
  if (!openai) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const prompt = `
You are a trading assistant.

Given:
- Market features
- News headlines

Return a JSON object conforming to this Zod schema:
const AIBiasOutputSchema = z.object({
  aiBias: z.enum(['Bullish', 'Bearish', 'Neutral']),
  confidence: z.number().min(0).max(1),
  tradeDirection: z.enum(['LONG', 'SHORT', 'HOLD']),
  reasoning: z.string()
});

Features:
${JSON.stringify(input.features, null, 2)}

News:
${input.news?.join("\n") || "None"}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional trading analyst that only responds with valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }, { signal: controller.signal });

    clearTimeout(timeoutId);

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
        return null;
    }
    
    const result = AIBiasOutputSchema.parse(JSON.parse(content));
    return result;

  } catch (err) {
    clearTimeout(timeoutId);
    console.error("AI error / Timeout:", (err as Error).message);
    return null; 
  }
}
