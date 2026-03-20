import 'dotenv/config';

import { BinanceWS } from '../src/market/websocket/binanceWS';
import { buildFeatureVector } from '../src/brain/featureBuilder';
import { runFullDecision, startBackgroundTasks } from '../src/brain/runFullDecision';
import { logDecision } from '../src/logger/tradeLogger';

const ws = new BinanceWS();

console.log("🚀 Starting LIVE War Room...\n");

startBackgroundTasks();

let isProcessing = false;
let lastProcessTime = 0;
const THROTTLE_MS = 3000;

ws.connect(async (tick) => {
  const now = Date.now();
  if (isProcessing) return;
  if (now - lastProcessTime < THROTTLE_MS) return;

  isProcessing = true;
  lastProcessTime = now;

  try {
    console.log("\n📡 Tick:", tick.price);

    const features = buildFeatureVector(tick);
    const result = await runFullDecision(features);

    logDecision(result);

    if (!result.strategy || result.strategy.bias === 'Neutral') {
      const reason = result.strategy?.strategyNotes || 'Low confidence';
      console.log(`⏸️  NO TRADE (${reason})`);
      return;
    }

    const signal = {
      price: tick.price,
      bias: result.strategy.bias,
      confidence: result.strategy.confidence,
    };

    console.log("📊 SIGNAL:", {
      price: signal.price,
      bias: signal.bias,
      confidence: signal.confidence,
      score: result.alphaLayer?.alphaScore,
    });
  } catch (err) {
    console.error("Pipeline run completely failed:", err);
  } finally {
    isProcessing = false;
  }
});
