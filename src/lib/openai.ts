import OpenAI from "openai";

let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
    // This warning will be shown in the server logs
    console.warn("⚠️  [OpenAI] API key is missing. Set OPENAI_API_KEY to enable AI features.");
}

export { openai };
