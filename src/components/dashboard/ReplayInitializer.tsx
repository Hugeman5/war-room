'use client';

import { useEffect, useRef } from 'react';
import { useReplayStore } from '@/store/replayStore';
import { useMarketDataStore } from '@/store/marketDataStore';
import { fetchScenarioData } from '@/replay/data';
import { marketDataBus } from '@/market/marketDataBus';
import type { Timeframe, Candle } from '@/lib/candle-builder';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { updateCandles } from '@/lib/candle-builder';

export default function ReplayInitializer() {
  const replayCandleCache = useRef<Partial<Record<Timeframe, Candle[]>>>({});
  const { isActive, isPlaying, speed, scenario, historicalData, currentIndex, actions } = useReplayStore();
  const { loadData, tick, pause } = actions;
  const { setFeedStatus, setPrice } = useMarketDataStore();
  const { setSystemStatus, resetSystemStatus } = useIntelligenceStore();

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

  // Effect to load data when scenario changes or replay is activated
  useEffect(() => {
    if (isActive) {
       // When replay is activated, reset all engine statuses to ensure a clean start
      resetSystemStatus();
      if (historicalData.length === 0) {
        const load = async () => {
          console.log(`[Replay] Loading data for scenario: ${scenario}`);
          const data = await fetchScenarioData(scenario);
          loadData(data);
          // Initialize candle cache
          timeframes.forEach(tf => {
            replayCandleCache.current[tf] = [];
          });
          console.log(`[Replay] Loaded ${data.length} historical candles.`);
        };
        load();
      }
    }
  }, [isActive, scenario, historicalData.length, loadData, resetSystemStatus]);

  // The main replay simulation loop
  useEffect(() => {
    if (!isActive) {
      setSystemStatus('replayEngine', 'DISABLED');
      return;
    }
    
    // When replay is on, we simulate a live feed connection
    setFeedStatus(true); 
    setSystemStatus('replayEngine', 'ACTIVE');
    
    if (!isPlaying || historicalData.length === 0) {
      return; // Don't run the loop if paused or no data
    }
    
    // Base interval of 1 second for 1x speed.
    const intervalDuration = 1000 / speed;

    const intervalId = setInterval(() => {
      const currentIdx = useReplayStore.getState().currentIndex;

      if (currentIdx >= historicalData.length - 1) {
        pause(); // Stop at the end
        return;
      }

      const historicalCandle = historicalData[currentIdx];
      
      const tradeData = {
          price: historicalCandle.close,
          quantity: historicalCandle.volume / 20, // Divide volume to simulate ticks
          time: historicalCandle.time * 1000
      };

      // Update all timeframes with the new "trade" data
      timeframes.forEach(tf => {
          const currentCandles = replayCandleCache.current[tf] || [];
          const updatedCandles = updateCandles(tradeData, tf, currentCandles);
          replayCandleCache.current[tf] = updatedCandles;
          
          const latestCandle = updatedCandles[updatedCandles.length - 1];
          if (latestCandle) {
              marketDataBus.publish({ timeframe: tf, candle: latestCandle });
          }
      });
      
      // Update the main price ticker
      setPrice(tradeData.price);
      
      // Advance to the next candle
      tick(1);
    }, intervalDuration);

    return () => clearInterval(intervalId);

  }, [isActive, isPlaying, speed, historicalData, tick, pause, setFeedStatus, setPrice, setSystemStatus]);

  return null;
}
