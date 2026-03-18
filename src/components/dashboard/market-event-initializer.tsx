'use client';

import { useEffect } from 'react';
import { useMarketEventStore } from '@/store/marketEventStore';
import { useMarketDataStore } from '@/store/marketDataStore';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { detectVolatilityEvents } from '@/intelligence/marketEventEngine';
import { detectSmartMoneyEvents } from '@/intelligence/smartMoneyFootprintEngine';
import { detectLiquiditySweepEvents } from '@/intelligence/liquiditySweepEngine';
import { detectWhaleEvents } from '@/intelligence/whaleEventEngine';
import type { Candle } from '@/lib/candle-builder';

const EVENT_DETECTION_INTERVAL = 5000; // 5 seconds

export default function MarketEventInitializer() {
  const { addEvents } = useMarketEventStore();
  const { candles15m } = useMarketDataStore();
  const { marketStructure } = useIntelligenceStore();

  useEffect(() => {
    let prevCandle: Candle | null = null;
    
    const runDetectors = () => {
      // Ensure we have data to work with
      if (candles15m.length === 0 || !marketStructure) {
        return;
      }
      
      const currentCandle = candles15m[candles15m.length - 1];

      // Avoid re-running detectors on the same candle data
      if (prevCandle && prevCandle.time === currentCandle.time) {
          return;
      }

      // Run all event detectors
      const volatilityEvents = detectVolatilityEvents(candles15m, prevCandle);
      const smartMoneyEvents = detectSmartMoneyEvents(candles15m);
      const liquiditySweepEvents = detectLiquiditySweepEvents(candles15m, marketStructure);
      const whaleEvents = detectWhaleEvents(candles15m);
      
      // Combine and add new events to the store
      const allNewEvents = [
          ...volatilityEvents,
          ...smartMoneyEvents,
          ...liquiditySweepEvents,
          ...whaleEvents
      ];
      
      if (allNewEvents.length > 0) {
        addEvents(allNewEvents);
      }
      
      prevCandle = currentCandle;
    };

    const intervalId = setInterval(runDetectors, EVENT_DETECTION_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);

  }, [candles15m, marketStructure, addEvents]);


  return null;
}
