
import type { Candle } from '@/lib/candle-builder';
import type { MarketStructure, OrderBlocks } from '../schemas';

export function analyzeOrderBlocks(
  candles: Candle[],
  structure: MarketStructure
): OrderBlocks {
  const lookback = 50;
  const recentCandles = candles.slice(-lookback);
  const swingPoints = structure.swingPoints;

  const bullishBlocks: OrderBlocks['bullish'] = [];
  const bearishBlocks: OrderBlocks['bearish'] = [];

  if (recentCandles.length < 10 || swingPoints.length < 2) {
    return { bullish: [], bearish: [] };
  }

  for (let i = recentCandles.length - 2; i > 1; i--) {
    const obCandle = recentCandles[i];
    
    const lastHighBeforeCandle = swingPoints.filter(p => p.type === 'high' && p.time < obCandle.time).pop();
    const lastLowBeforeCandle = swingPoints.filter(p => p.type === 'low' && p.time < obCandle.time).pop();

    if (!lastHighBeforeCandle || !lastLowBeforeCandle) continue;

    let subsequentBreak = false;
    for (let j = i + 1; j < recentCandles.length; j++) {
        const breakCandle = recentCandles[j];

        if (obCandle.close < obCandle.open && breakCandle.high > lastHighBeforeCandle.price) {
            bullishBlocks.push({
                priceRange: [obCandle.low, obCandle.high],
                time: obCandle.time,
                status: 'active',
            });
            subsequentBreak = true;
            break;
        }
        
        if (obCandle.close > obCandle.open && breakCandle.low < lastLowBeforeCandle.price) {
             bearishBlocks.push({
                priceRange: [obCandle.low, obCandle.high],
                time: obCandle.time,
                status: 'active',
            });
            subsequentBreak = true;
            break;
        }
    }

    if (subsequentBreak) {
      i = recentCandles.findIndex(c => c.time === obCandle.time);
    }
    
    if (bullishBlocks.length >= 5 && bearishBlocks.length >= 5) break;
  }
  
  const finalBullish = [...new Map(bullishBlocks.map(item => [item.time, item])).values()].slice(-5);
  const finalBearish = [...new Map(bearishBlocks.map(item => [item.time, item])).values()].slice(-5);
  
  const lastPrice = candles[candles.length - 1].close;
  finalBullish.forEach(block => {
      if(lastPrice < block.priceRange[0]) block.status = 'mitigated';
  });
   finalBearish.forEach(block => {
      if(lastPrice > block.priceRange[1]) block.status = 'mitigated';
  });

  const activeBlocks = finalBullish.filter(b => b.status === 'active').length + finalBearish.filter(b => b.status === 'active').length;
  
  const strength = Math.min(100, activeBlocks * 20 + finalBullish.length * 5 + finalBearish.length * 5);

  return {
    bullish: finalBullish,
    bearish: finalBearish,
    activeBlockCount: activeBlocks,
    strength,
  };
}
