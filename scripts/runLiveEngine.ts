import 'dotenv/config';

import { BinanceWS } from '../src/market/websocket/binanceWS';
import { buildFeatureVector } from '../src/brain/featureBuilder';
import { runFullDecision } from '../src/brain/runFullDecision';
import { logDecision } from '../src/logger/tradeLogger';

const ws = new BinanceWS();

console.log("🚀 Starting LIVE War Room...\n");

ws.connect(async (tick) => {
  console.log("\n📡 Tick:", tick.price);

  const features = buildFeatureVector(tick);

  const result = await runFullDecision(features);

  logDecision(result);

  // The runFullDecision function already filters for confidence > 60% by setting bias to 'Neutral'.
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
});
