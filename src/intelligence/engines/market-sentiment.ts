
import type { Candle } from '@/lib/candle-builder';
import type { MarketSentiment } from '../schemas';

// This is a simulated sentiment engine. A real system would use NLP on news/social media.
export async function analyzeMarketSentiment(candles: Candle[]): Promise<MarketSentiment> {
  if (candles.length < 50) {
    // Not enough data for a meaningful analysis
    return { sentiment: 'neutral', confidence: 0.3 };
  }

  const lookback = 30;
  const recentCandles = candles.slice(-lookback);
  
  const volumeAvg = recentCandles.reduce((acc, c) => acc + (c.volume || 0), 0) / recentCandles.length;
  const lastCandle = recentCandles[recentCandles.length - 1];

  let score = 0;

  // 1. Trend Pressure (Price action over the lookback period)
  const startPrice = recentCandles[0].open;
  const endPrice = lastCandle.close;
  const priceChange = (endPrice - startPrice) / startPrice;
  score += priceChange * 5; // A 2% price change gives a 0.1 score contribution

  // 2. Volume Momentum (High volume on the last candle)
  if (lastCandle.volume > volumeAvg * 1.5) {
    score += lastCandle.close > lastCandle.open ? 0.15 : -0.15;
  }
  
  // 3. Reversal Wick Check (Hammer/Shooting Star pattern)
  const bodySize = Math.abs(lastCandle.close - lastCandle.open);
  const candleRange = lastCandle.high - lastCandle.low;
  if (candleRange > 0) {
      const lowerWick = (lastCandle.open > lastCandle.close ? lastCandle.close : lastCandle.open) - lastCandle.low;
      const upperWick = lastCandle.high - (lastCandle.open > lastCandle.close ? lastCandle.open : lastCandle.close);
      
      // Strong rejection from below (bullish)
      if (lowerWick / candleRange > 0.5 && bodySize / candleRange < 0.3) {
          score += 0.2;
      }
      // Strong rejection from above (bearish)
      if (upperWick / candleRange > 0.5 && bodySize / candleRange < 0.3) {
          score -= 0.2;
      }
  }


  // Normalize score and determine sentiment
  const confidence = Math.min(1, Math.abs(score) * 2 + 0.4); // Base confidence of 0.4, scales with score
  let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (score > 0.1) sentiment = 'bullish';
  if (score < -0.1) sentiment = 'bearish';

  return { sentiment, confidence };
}
