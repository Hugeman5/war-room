
'use client';

import { useEffect, useRef } from 'react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { useTradeHistoryStore } from '@/store/tradeHistoryStore';
import { useMarketDataStore } from '@/store/marketDataStore';
import { runAdaptiveCycle } from '@/intelligence/engines/adaptive-learning';
import type { CompletedTrade, IntelligenceSnapshot } from '@/intelligence/schemas';
import type { Candle } from '@/lib/candle-builder';

const CYCLE_INTERVAL = 300_000; // 5 minutes
const MIN_TRADES_FOR_OPTIMIZATION = 20;
const SEED_TRADE_COUNT = 200;

// --- Historical Trade Seeding Engine ---
function seedHistoricalTrades(candles: Candle[]): CompletedTrade[] {
    console.log(`[Adaptive Engine] Seeding database with historical trades...`);
    const trades: CompletedTrade[] = [];
    if (candles.length < SEED_TRADE_COUNT) {
        console.warn("[Adaptive Engine] Not enough historical candles to seed database.");
        return [];
    }

    // Iterate through historical data, skipping some candles to get variety
    for (let i = 50; i < candles.length - 20; i += Math.floor((candles.length - 70) / SEED_TRADE_COUNT)) {
        const entryCandle = candles[i];
        
        const isBullishSetup = Math.random() > 0.5;
        const entryPrice = entryCandle.close;

        let stopLoss: number, targets: number[];
        const riskRange = (entryCandle.high - entryCandle.low) * 1.5;

        if (isBullishSetup) {
            stopLoss = entryPrice - riskRange;
            targets = [entryPrice + riskRange * 2, entryPrice + riskRange * 3];
        } else {
            stopLoss = entryPrice + riskRange;
            targets = [entryPrice - riskRange * 2, entryPrice - riskRange * 3];
        }

        // Determine outcome by looking ahead
        let outcome: 'WIN' | 'LOSS' = 'LOSS';
        let profitOrLoss = -(Math.abs(entryPrice - stopLoss));

        for (let j = i + 1; j < i + 20 && j < candles.length; j++) {
            const outcomeCandle = candles[j];
            if (isBullishSetup) {
                if (outcomeCandle.high > targets[0]) {
                    outcome = 'WIN';
                    profitOrLoss = Math.abs(targets[0] - entryPrice);
                    break;
                }
                if (outcomeCandle.low < stopLoss) {
                    outcome = 'LOSS';
                    break;
                }
            } else { // Bearish
                if (outcomeCandle.low < targets[0]) {
                    outcome = 'WIN';
                    profitOrLoss = Math.abs(entryPrice - targets[0]);
                    break;
                }
                if (outcomeCandle.high > stopLoss) {
                    outcome = 'LOSS';
                    break;
                }
            }
        }
        
        // Create a mock snapshot
        const mockSnapshot: Partial<IntelligenceSnapshot> = {
            marketRegime: { 
                regime: Math.random() > 0.5 ? 'TRENDING' : 'RANGING', 
                confidence: Math.random() * 0.5 + 0.3,
                volatilityState: 'NORMAL'
            },
            marketStructure: { 
                trend: isBullishSetup ? 'bullish' : 'bearish', 
                events: [], 
                swingPoints: [], 
                lastHigh: null, 
                lastLow: null,
                strength: 50
            },
            liquidityMap: {
              liquidityAbove: entryPrice * 1.02,
              liquidityBelow: entryPrice * 0.98,
              equalHighs: false,
              equalLows: false,
              nearestPool: "above",
              density: "medium",
              sweepProbability: Math.random(),
              stopClusters: { above: 0, below: 0 },
              description: ""
            }
        };

        trades.push({
            id: `seed-trade-${entryCandle.time}`,
            timestamp: entryCandle.time * 1000,
            bias: isBullishSetup ? 'Bullish' : 'Bearish',
            entryPrice,
            stopLoss,
            targets,
            outcome,
            profitOrLoss,
            snapshot: mockSnapshot,
        });
    }

    console.log(`[Adaptive Engine] Generated ${trades.length} historical trades for seeding.`);
    return trades;
}


export default function AdaptiveIntelligenceInitializer() {
  const lastCycleTime = useRef(Date.now());
  const hasSeeded = useRef(false);

  useEffect(() => {
    const runCycle = async () => {
      // Get latest state at the time of execution to avoid stale closures
      const { setSystemStatus } = useIntelligenceStore.getState();
      const { candles15m } = useMarketDataStore.getState();
      const { setTradeHistory, updatePerformance, updateAdaptiveWeights } = useTradeHistoryStore.getState();

      // --- ONE-TIME HISTORICAL SEEDING ---
      if (!hasSeeded.current && useTradeHistoryStore.getState().tradeHistory.length === 0 && candles15m.length > 100) {
        console.log("[Adaptive Engine] Trade history is empty. Initiating historical seeding.");
        const historicalTrades = seedHistoricalTrades(candles15m);
        if (historicalTrades.length > 0) {
          setTradeHistory(historicalTrades);
        }
        hasSeeded.current = true;
      }
      
      // Get state again in case a trade was just added
      const currentTradeHistory = useTradeHistoryStore.getState().tradeHistory;
      const currentAdaptiveWeights = useTradeHistoryStore.getState().adaptiveWeights;
      
      const now = Date.now();
      const enoughTimePassed = now - lastCycleTime.current > CYCLE_INTERVAL;
      const hasEnoughTradesForOptimization = currentTradeHistory.length >= MIN_TRADES_FOR_OPTIMIZATION;

      // First, update performance stats if there's any history
      if (currentTradeHistory.length > 0) {
        const perf = await runAdaptiveCycle(currentTradeHistory, currentAdaptiveWeights);
        updatePerformance(perf.performance);
      }

      // Main state machine for engine status
      if (!hasEnoughTradesForOptimization) {
        setSystemStatus('adaptiveEngine', 'LEARNING');
        return; // Done for this cycle, just learning
      }
      
      // If we reach here, there are enough trades, so the engine is at least 'ACTIVE'
      setSystemStatus('adaptiveEngine', 'ACTIVE');
      
      if (enoughTimePassed) {
        console.log("Triggering Adaptive Intelligence Cycle...");
        try {
            const { newWeights, performance } = await runAdaptiveCycle(currentTradeHistory, currentAdaptiveWeights);
            updateAdaptiveWeights(newWeights);
            updatePerformance(performance);
            console.log("Adaptive cycle successful. Weights and performance updated.");
        } catch (error) {
            console.error("Adaptive Intelligence Cycle failed:", error);
            setSystemStatus('adaptiveEngine', 'FAILED');
        }
        lastCycleTime.current = now;
      }
      // If it's not time to optimize, the status remains 'ACTIVE' (i.e., ready and waiting).
    };

    const interval = setInterval(runCycle, 60000); // Run check every minute

    // Run once on mount to set initial state correctly
    runCycle();

    return () => clearInterval(interval);

  }, []); // Empty dependency array ensures this runs only once and manages its own lifecycle.

  return null;
}
