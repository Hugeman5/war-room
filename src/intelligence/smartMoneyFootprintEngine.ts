'use client';

import type { Candle } from '@/lib/candle-builder';
import type { SmartMoneyEvent } from '@/store/marketEventStore';

export function detectSmartMoneyEvents(candles: Candle[]): SmartMoneyEvent[] {
    const events: SmartMoneyEvent[] = [];
    const lookback = 30;
    if (candles.length < lookback) return [];

    const recentCandles = candles.slice(-lookback);
    const volumeAvg = recentCandles.reduce((acc, c) => acc + (c.volume ?? 0), 0) / recentCandles.length;

    const lastCandle = recentCandles[recentCandles.length - 1];

    // Absorption Detection
    const lowerWick = Math.min(lastCandle.open, lastCandle.close) - lastCandle.low;
    const candleRange = lastCandle.high - lastCandle.low;
    if (candleRange > 0 && lowerWick / candleRange > 0.6 && lastCandle.volume > volumeAvg * 2) {
        events.push({
            id: `sm-absorp-${lastCandle.time}`,
            timestamp: Date.now(),
            time: lastCandle.time,
            type: 'SMART_MONEY',
            impact: 'HIGH',
            priceLevel: lastCandle.low,
            content: `Smart Money Absorption detected at ${lastCandle.low.toFixed(2)}`,
            details: {
                activity: 'absorption',
                direction: 'bullish',
                strength: 0.8
            }
        });
    }

    // Distribution Detection (inverse of absorption)
    const upperWick = lastCandle.high - Math.max(lastCandle.open, lastCandle.close);
     if (candleRange > 0 && upperWick / candleRange > 0.6 && lastCandle.volume > volumeAvg * 2) {
        events.push({
            id: `sm-dist-${lastCandle.time}`,
            timestamp: Date.now(),
            time: lastCandle.time,
            type: 'SMART_MONEY',
            impact: 'HIGH',
            priceLevel: lastCandle.high,
            content: `Smart Money Distribution detected at ${lastCandle.high.toFixed(2)}`,
            details: {
                activity: 'distribution',
                direction: 'bearish',
                strength: 0.8
            }
        });
    }
    
    return events;
}
