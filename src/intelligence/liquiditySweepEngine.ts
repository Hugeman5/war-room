'use client';

import type { Candle } from '@/lib/candle-builder';
import type { MarketStructure, SwingPoint } from './schemas';
import type { LiquiditySweepEvent } from '@/store/marketEventStore';

export function detectLiquiditySweepEvents(
  candles: Candle[],
  structure: MarketStructure
): LiquiditySweepEvent[] {
  const events: LiquiditySweepEvent[] = [];
  if (candles.length < 5 || !structure.swingPoints || structure.swingPoints.length < 2) {
    return [];
  }
  
  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];

  const checkSweep = (swingPoint: SwingPoint) => {
    if (lastCandle.time <= swingPoint.time) return;

    const isBuySide = swingPoint.type === 'high';
    let isSweep = false;
    let strength = 0;

    if (isBuySide) {
      // Price went above the high, then closed back below it
      if (lastCandle.high > swingPoint.price && lastCandle.close < swingPoint.price) {
        isSweep = true;
        strength = (lastCandle.high - swingPoint.price) / swingPoint.price;
      }
    } else { // Sell-side
      // Price went below the low, then closed back above it
      if (lastCandle.low < swingPoint.price && lastCandle.close > swingPoint.price) {
        isSweep = true;
        strength = (swingPoint.price - lastCandle.low) / swingPoint.price;
      }
    }
    
    if (isSweep && strength > 0.0005) { // Threshold for a meaningful sweep (0.05%)
       events.push({
         id: `sweep-${swingPoint.time}-${swingPoint.type}`,
         timestamp: Date.now(),
         time: lastCandle.time,
         type: 'LIQUIDITY_SWEEP',
         impact: 'HIGH',
         priceLevel: swingPoint.price,
         content: `Liquidity sweep of ${isBuySide ? 'buy-side' : 'sell-side'} at ${swingPoint.price.toFixed(2)}`,
         details: {
           direction: isBuySide ? 'buy-side' : 'sell-side',
           strength,
         }
       });
    }
  }

  // Check the last two swing points of each type
  const lastHighs = structure.swingPoints.filter(p => p.type === 'high').slice(-2);
  const lastLows = structure.swingPoints.filter(p => p.type === 'low').slice(-2);
  
  lastHighs.forEach(checkSweep);
  lastLows.forEach(checkSweep);

  return events;
}
