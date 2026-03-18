'use client';

import type { Candle } from '@/lib/candle-builder';
import type { WhaleEvent } from '@/store/marketEventStore';
import { formatPrice } from '@/lib/priceFormatter';

const WHALE_THRESHOLD_BTC = 100;
let lastWhaleEventTime = 0;
const EVENT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// This is a simulated engine to generate UI events for whale activity.
export function detectWhaleEvents(candles: Candle[]): WhaleEvent[] {
  const events: WhaleEvent[] = [];
  if (candles.length < 5) return [];

  const now = Date.now();
  if (now - lastWhaleEventTime < EVENT_COOLDOWN_MS) {
    return []; // Cooldown period to prevent spamming events
  }

  const lastCandle = candles[candles.length - 1];
  const volume = lastCandle.volume ?? 0;
  const price = lastCandle.close;

  if (volume > WHALE_THRESHOLD_BTC * 5) { // Needs a significant volume spike
    const btcAmount = Math.floor(volume / 2); // Assume half the volume is one big trade
    if (btcAmount < WHALE_THRESHOLD_BTC) return [];

    const usdValue = btcAmount * price;
    const isBearish = lastCandle.close < lastCandle.open;
    const direction = isBearish ? 'exchange_inflow' : 'exchange_outflow';
    
    const directionText = direction === 'exchange_inflow' ? 'to exchange' : 'from exchange';
    const content = `Whale Transfer: ${btcAmount.toLocaleString()} BTC (${formatPrice(usdValue)}) moved ${directionText}.`;
    
    events.push({
      id: `whale-${lastCandle.time}`,
      timestamp: now,
      time: lastCandle.time,
      type: 'WHALE',
      impact: 'HIGH',
      priceLevel: price,
      content,
      details: {
        direction,
        btcAmount,
        usdValue,
      }
    });

    lastWhaleEventTime = now;
  }

  return events;
}
