import 'dotenv/config';
import { runFullDecision } from "../src/brain/runFullDecision";
import type { FeatureVector } from "../src/types/market";

const mockFeatureVector: FeatureVector = {
  orderbookImbalance: 0.5,
  liquidationPressure: 0.2,
  fundingPressure: 0.01,
  oiMomentum: 0.4,
  volatility: 0.2,
  priceMomentum: 0.6,
};

async function test() {
  console.log("🚀 Running War Room Test...\n");

  // This requires environment variables to be loaded from .env.local
  const result = await runFullDecision(mockFeatureVector);

  console.log("📊 RESULT:");
  console.dir(result, { depth: null });
}

test().catch(err => {
    console.error("Test pipeline failed:", err);
    process.exit(1);
});
