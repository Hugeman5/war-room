
import type { Candle, Timeframe } from '@/lib/candle-builder';
import { analyzeMarketStructure } from './market-structure';
import type { MultiTimeframeAlignment } from '../schemas';

function getSimpleTrend(candles: Candle[]): 'bullish' | 'bearish' | 'sideways' {
    if (candles.length < 20) return 'sideways';
    const startPrice = candles[0].open;
    const endPrice = candles[candles.length - 1].close;
    const change = (endPrice - startPrice) / startPrice;

    if (change > 0.01) return 'bullish';
    if (change < -0.01) return 'bearish';
    return 'sideways';
}

export async function analyzeMultiTimeframeAlignment(
  candleSets: Record<Timeframe, Candle[]>
): Promise<MultiTimeframeAlignment> {
  const trends: Record<string, 'bullish' | 'bearish' | 'sideways'> = {};
  
  if (candleSets['1m']?.length > 0) trends['1m'] = getSimpleTrend(candleSets['1m']);
  if (candleSets['5m']?.length > 0) trends['5m'] = getSimpleTrend(candleSets['5m']);
  if (candleSets['15m']?.length > 0) trends['15m'] = analyzeMarketStructure(candleSets['15m']).trend;
  if (candleSets['1h']?.length > 0) trends['1h'] = analyzeMarketStructure(candleSets['1h']).trend;
  if (candleSets['4h']?.length > 0) trends['4h'] = analyzeMarketStructure(candleSets['4h']).trend;

  const htf = [trends['15m'], trends['1h'], trends['4h']].filter(Boolean);
  
  if (htf.length < 2) {
      return { alignment: 'mixed', strength: 0.3 };
  }

  const allBullish = htf.every(t => t === 'bullish');
  const allBearish = htf.every(t => t === 'bearish');
  
  if (allBullish) {
    return { alignment: 'bullish', strength: 0.8 };
  }
  
  if (allBearish) {
    return { alignment: 'bearish', strength: 0.8 };
  }

  const bullishCount = htf.filter(t => t === 'bullish').length;
  const bearishCount = htf.filter(t => t === 'bearish').length;

  if (bullishCount > bearishCount) {
      return { alignment: 'bullish', strength: 0.5 };
  }
  if (bearishCount > bullishCount) {
      return { alignment: 'bearish', strength: 0.5 };
  }

  return { alignment: 'mixed', strength: 0.4 };
}
