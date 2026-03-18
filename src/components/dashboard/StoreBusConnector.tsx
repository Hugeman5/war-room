'use client';

import { useEffect } from 'react';
import { marketDataBus } from '@/market/marketDataBus';
import { useMarketDataStore } from '@/store/marketDataStore';

export default function StoreBusConnector() {
  const { setCandlesForTimeframe } = useMarketDataStore();

  useEffect(() => {
    const unsubscribe = marketDataBus.subscribe(({ timeframe, candle }) => {
      // Get the latest state directly from the store to avoid stale closures
      const currentCandles = (useMarketDataStore.getState() as any)[`candles${timeframe}`];
      
      const newCandles = [...currentCandles];
      const lastCandleInStore = newCandles.length > 0 ? newCandles[newCandles.length - 1] : null;

      if (lastCandleInStore && lastCandleInStore.time === candle.time) {
        // This is an update to the last candle
        newCandles[newCandles.length - 1] = candle;
      } else if (!lastCandleInStore || candle.time > lastCandleInStore.time) {
        // This is a new candle
        newCandles.push(candle);
      }

      // Keep buffer of 500 candles
      const finalCandles = newCandles.length > 500 ? newCandles.slice(newCandles.length - 500) : newCandles;

      setCandlesForTimeframe(timeframe, finalCandles);
    });

    return () => unsubscribe();
  }, [setCandlesForTimeframe]);

  return null; // This component does not render anything
}
