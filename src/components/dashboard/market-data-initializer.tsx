
'use client';

import { useEffect } from 'react';
import { useMarketDataStore } from '@/store/marketDataStore';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import type { Trade, BtcCandle } from '@/market/data';
import { fetchBTCCandles, fetchBTCPrice } from '@/market/data/binance';
import { updateCandles } from '@/lib/candle-builder';
import type { Timeframe, Candle } from '@/lib/candle-builder';
import { useLatencyStore } from '@/store/latencyStore';
import { useReplayStore } from '@/store/replayStore';
import { marketDataBus } from '@/market/marketDataBus';
import { initializeMarketSocket, disconnectMarketSocket } from '@/market/marketSocket';

const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

export default function MarketDataInitializer() {
  const { setPrice, addTrade, setCandlesForTimeframe, setFeedStatus } = useMarketDataStore();
  const { setSystemStatus } = useIntelligenceStore();
  const { setLatency } = useLatencyStore();
  const isReplayActive = useReplayStore(state => state.isActive);

  useEffect(() => {
    // --- IF REPLAY IS ACTIVE, DO NOTHING ---
    if (isReplayActive) {
      console.log("[MarketDataInitializer] Replay mode is active. Live feed disabled.");
      setFeedStatus(false);
      setSystemStatus('feed', 'DISABLED');
      disconnectMarketSocket();
      return;
    }
    // --- END REPLAY CHECK ---

    let mounted = true;
    setSystemStatus('feed', 'PENDING');

    // -----------------------------
    // INITIAL DATA LOAD
    // -----------------------------
    const loadInitialData = async () => {
      try {
        setSystemStatus('dataLoader', 'PENDING');
        const pricePromise = fetchBTCPrice();
        const candlePromises = timeframes.map(tf => fetchBTCCandles(tf));
        
        const [price, ...candlesByTimeframe] = await Promise.all([pricePromise, ...candlePromises]);
        
        if (!mounted) return;

        if (price) setPrice(price);
        
        candlesByTimeframe.forEach((candles, index) => {
            const timeframe = timeframes[index];
            if (candles?.length) {
                const formattedCandles: Candle[] = candles.map((c: BtcCandle) => ({
                    time: c.timestamp / 1000,
                    open: parseFloat(c.open),
                    high: parseFloat(c.high),
                    low: parseFloat(c.low),
                    close: parseFloat(c.close),
                    volume: parseFloat(c.volume),
                })).sort((a,b) => a.time - b.time);

                setCandlesForTimeframe(timeframe, formattedCandles);
            }
        });
        setSystemStatus('dataLoader', 'ACTIVE');
      } catch (err) {
        console.error('Initial market data load failed:', err);
        setSystemStatus('dataLoader', 'FAILED');
      }
    };

    loadInitialData();

    // -----------------------------
    // BINANCE WEBSOCKET SINGLETON
    // -----------------------------
    const handleStatusChange = (isConnected: boolean) => {
        if (!mounted) return;
        setFeedStatus(isConnected);
        setSystemStatus('feed', isConnected ? 'ACTIVE' : 'DEGRADED');
    }

    const handleNewTrade = (data: any) => {
        if (!data?.p || !data?.q || !data?.T) return;
        
        // --- LATENCY CALCULATION ---
        const feedLatency = Date.now() - data.T;
        setLatency({ feedLatency });
        // --- END LATENCY CALCULATION ---

        const trade: Trade = {
            id: data.t,
            price: Number(data.p),
            quantity: Number(data.q),
            time: new Date(data.T).toLocaleTimeString('en-US', {
              hour12: false,
            }),
        };

        // These can be set directly as they don't cause engine race conditions
        setPrice(trade.price);
        addTrade(trade);
        
        const store = useMarketDataStore.getState();
        timeframes.forEach(tf => {
            const currentCandles = (store as any)[`candles'${tf}'`];
            const updatedCandles = updateCandles(
                { price: trade.price, quantity: trade.quantity, time: data.T },
                tf,
                currentCandles
            );
            // Publish the latest candle to the central bus
            const latestCandle = updatedCandles[updatedCandles.length - 1];
            if (latestCandle) {
                marketDataBus.publish({ timeframe: tf, candle: latestCandle });
            }
        });
    }

    initializeMarketSocket(handleStatusChange, handleNewTrade);

    // -----------------------------
    // CLEANUP
    // -----------------------------
    return () => {
      mounted = false;
      disconnectMarketSocket();
    };
  }, [isReplayActive, setPrice, addTrade, setCandlesForTimeframe, setFeedStatus, setSystemStatus, setLatency]);

  return null;
}
