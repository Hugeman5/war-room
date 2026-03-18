
import type { Candle } from '@/lib/candle-builder';
import type { WhaleIntelligence } from '../schemas';

// This is a simulated engine. A real implementation would connect to a blockchain data source.
export async function analyzeWhaleIntelligence(candles: Candle[]): Promise<WhaleIntelligence> {
  if (candles.length < 20) {
    return { dominantActivity: 'none', strength: 0, netflow: 0 };
  }

  const lookback = 20;
  const recentCandles = candles.slice(-lookback);
  const volumeAvg = recentCandles.reduce((acc, c) => acc + (c.volume ?? 0), 0) / recentCandles.length;

  for (let i = recentCandles.length - 1; i > 0; i--) {
    const candle = recentCandles[i];
    const isHighVolume = (candle.volume ?? 0) > volumeAvg * 4; // 4x average volume
    const isLargeBody = Math.abs(candle.close - candle.open) > (candle.high - candle.low) * 0.6;

    if (isHighVolume && isLargeBody) {
      const usdVolume = (candle.volume ?? 0) * candle.close;
      if (candle.close > candle.open) {
        // Large bullish candle on high volume -> simulated exchange outflow (accumulation)
        return {
          dominantActivity: 'exchange_outflow',
          strength: 0.75,
          netflow: -usdVolume,
        };
      } else {
        // Large bearish candle on high volume -> simulated exchange inflow (selling)
        return {
          dominantActivity: 'exchange_inflow',
          strength: 0.75,
          netflow: usdVolume,
        };
      }
    }
  }

  return { dominantActivity: 'none', strength: 0, netflow: 0 };
}
