
import type { Candle } from '@/lib/candle-builder';
import type { SmartMoney } from '../schemas';

export function analyzeSmartMoney(candles: Candle[]): SmartMoney {
    const lookback = 50;
    if (candles.length < lookback) return { activity: 'none', strength: 0 };
    
    const recentCandles = candles.slice(-lookback);
    const volumeAvg = recentCandles.reduce((acc, c) => acc + (c.volume || 0), 0) / recentCandles.length;

    for (let i = recentCandles.length - 2; i > 0; i--) {
        const candle = recentCandles[i];
        const prevCandle = recentCandles[i-1];

        // 1. Absorption Check (long lower wick on high volume)
        const lowerWick = candle.close > candle.open ? candle.open - candle.low : candle.close - candle.low;
        const candleRange = candle.high - candle.low;
        const isAbsorption = candleRange > 0 && lowerWick / candleRange > 0.5 && candle.volume > volumeAvg * 1.8;
        if (isAbsorption && candle.low < prevCandle.low) {
            return { activity: 'absorption', strength: 0.75 };
        }

        // 2. High Volume Ignition
        const isHighVolume = candle.volume > volumeAvg * 2.5;
        const isLargeBody = Math.abs(candle.close - candle.open) > (candleRange * 0.7);
        if (isHighVolume && isLargeBody) {
            if (candle.close > candle.open) return { activity: 'accumulation', strength: 0.8 };
            return { activity: 'distribution', strength: 0.8 };
        }
    }

    return { activity: 'none', strength: 0 };
}
