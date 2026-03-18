
import type { Candle } from '@/lib/candle-builder';
import type {
  MarketRegime,
  MarketStructure,
  SwingPoint,
  MarketStructureEvent,
} from '../schemas';

const SWING_LOOKBACK = 3;

function findSwingPoints(candles: Candle[]): SwingPoint[] {
  const swings: SwingPoint[] = [];
  if (candles.length < SWING_LOOKBACK * 2 + 1) {
    return [];
  }

  for (let i = SWING_LOOKBACK; i < candles.length - SWING_LOOKBACK; i++) {
    const candle = candles[i];

    let isSwingHigh = true;
    for (let j = 1; j <= SWING_LOOKBACK; j++) {
      if (candles[i - j].high > candle.high || candles[i + j].high > candle.high) {
        isSwingHigh = false;
        break;
      }
    }
    if (isSwingHigh) {
      swings.push({ time: candle.time, price: candle.high, type: 'high' });
      continue;
    }

    let isSwingLow = true;
    for (let j = 1; j <= SWING_LOOKBACK; j++) {
      if (candles[i - j].low < candle.low || candles[i + j].low < candle.low) {
        isSwingLow = false;
        break;
      }
    }
    if (isSwingLow) {
      swings.push({ time: candle.time, price: candle.low, type: 'low' });
    }
  }
  return swings;
}

export function analyzeMarketStructure(candles: Candle[]): MarketStructure {
  const swingPoints = findSwingPoints(candles);
  const highs = swingPoints.filter((s) => s.type === 'high');
  const lows = swingPoints.filter((s) => s.type === 'low');
  const events: MarketStructureEvent[] = [];

  let trend: 'bullish' | 'bearish' | 'sideways' = 'sideways';

  const lastHigh = highs.length > 0 ? highs[highs.length - 1] : null;
  const lastLow = lows.length > 0 ? lows[lows.length - 1] : null;

  const lastSwingHigh = highs.length > 1 ? highs[highs.length - 2] : null;
  const lastSwingLow = lows.length > 1 ? lows[lows.length - 2] : null;
  const currentPrice = candles.length > 0 ? candles[candles.length - 1].close : 0;

  if (lastHigh && lastSwingHigh && lastLow && lastSwingLow) {
    const isHH = lastHigh.price > lastSwingHigh.price;
    const isHL = lastLow.price > lastSwingLow.price;
    const isLL = lastLow.price < lastSwingLow.price;
    const isLH = lastHigh.price < lastSwingHigh.price;

    if (isHH && isHL) trend = 'bullish';
    if (isLL && isLH) trend = 'bearish';

    if (trend === 'bullish' && currentPrice > lastHigh.price) {
      events.push({
        id: `BOS-${lastHigh.time}`,
        type: 'BOS',
        direction: 'bullish',
        price: lastHigh.price,
        time: lastHigh.time,
      });
    }
    if (trend === 'bearish' && currentPrice < lastLow.price) {
      events.push({
        id: `BOS-${lastLow.time}`,
        type: 'BOS',
        direction: 'bearish',
        price: lastLow.price,
        time: lastLow.time,
      });
    }

    if (trend === 'bullish' && currentPrice < lastLow.price) {
      events.push({
        id: `CHOCH-${lastLow.time}`,
        type: 'CHOCH',
        direction: 'bearish',
        price: lastLow.price,
        time: lastLow.time,
      });
      trend = 'bearish';
    }
    if (trend === 'bearish' && currentPrice > lastHigh.price) {
      events.push({
        id: `CHOCH-${lastHigh.time}`,
        type: 'CHOCH',
        direction: 'bullish',
        price: lastHigh.price,
        time: lastHigh.time,
      });
      trend = 'bullish';
    }
  }

  let strength = 50;
  if (highs.length >= 2 && lows.length >= 2) {
      const hh = highs[highs.length - 1].price > highs[highs.length - 2].price;
      const hl = lows[lows.length - 1].price > lows[lows.length - 2].price;
      const ll = lows[lows.length - 1].price < lows[lows.length - 2].price;
      const lh = highs[highs.length - 1].price < highs[highs.length - 2].price;

      if (trend === 'bullish') {
          let score = 0;
          if (hh) score++;
          if (hl) score++;
          strength = 50 + (score * 25);
      } else if (trend === 'bearish') {
          let score = 0;
          if (ll) score++;
          if (lh) score++;
          strength = 50 + (score * 25);
      }
  }

  const lastEvent = events.length > 0 ? events[events.length - 1] : null;
  if (lastEvent && lastEvent.type === 'CHOCH') {
      strength = 30;
  }

  return {
    trend,
    swingPoints,
    events,
    lastHigh,
    lastLow,
    strength: Math.round(strength),
  };
}

export function analyzeMarketRegime(
  candles: Candle[],
  structure: MarketStructure
): MarketRegime {
  if (candles.length < 20) {
    return { 
        regime: 'RANGING', 
        confidence: 0.3,
        trendStrength: structure.strength, 
        volatilityScore: 20 
    };
  }

  const recentCandles = candles.slice(-20);
  const bodySizes = recentCandles.map((c) => Math.abs(c.close - c.open));
  const avgBodySize = bodySizes.reduce((a, b) => a + b, 0) / bodySizes.length;
  const recentRange =
    Math.max(...recentCandles.map((c) => c.high)) -
    Math.min(...recentCandles.map((c) => c.low));
  const avgPrice =
    recentCandles.reduce((sum, c) => sum + c.close, 0) / recentCandles.length;
  const normalizedRange = recentRange / avgPrice;

  const volatilityScore = Math.min(100, (normalizedRange / 0.05) * 100);
  const trendStrength = structure.strength;

  let volState: 'EXPANDING' | 'COMPRESSING' | 'NORMAL' = 'NORMAL';
  if (volatilityScore > 70) volState = 'EXPANDING';
  if (volatilityScore < 30) volState = 'COMPRESSING';

  if (structure.trend !== 'sideways' && normalizedRange > 0.03) {
    return { 
        regime: 'TRENDING', 
        confidence: 0.75, 
        volatilityState: volState,
        volatilityScore,
        trendStrength,
    };
  }
  if (normalizedRange < 0.015) {
    const confidence = 0.8;
    const regime = structure.trend === 'bullish' ? 'ACCUMULATION' : structure.trend === 'bearish' ? 'DISTRIBUTION' : 'RANGING';
    return { 
        regime,
        confidence, 
        volatilityState: 'COMPRESSING',
        volatilityScore,
        trendStrength,
    };
  }
  if (avgBodySize > avgPrice * 0.005 && volatilityScore > 60) {
    return { 
        regime: 'BREAKOUT', 
        confidence: 0.7, 
        volatilityState: 'EXPANDING',
        volatilityScore,
        trendStrength,
    };
  }

  return { 
      regime: 'RANGING', 
      confidence: 0.5, 
      volatilityState: volState,
      volatilityScore,
      trendStrength,
    };
}
