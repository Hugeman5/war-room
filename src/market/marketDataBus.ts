
import type { Candle, Timeframe } from '@/lib/candle-builder';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';

type MarketDataPayload = {
  timeframe: Timeframe;
  candle: Candle;
};

type Subscriber = (payload: MarketDataPayload) => void;

export class MarketDataBus {
  private subscribers: Subscriber[] = [];
  private lastTimestamps: Partial<Record<Timeframe, number>> = {};

  subscribe(callback: Subscriber): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  publish(payload: MarketDataPayload) {
    const { timeframe, candle } = payload;

    // Prevent publishing duplicate candle updates for the same timestamp
    if (this.lastTimestamps[timeframe] === candle.time && candle.volume === 0) {
        // This condition is tricky. A simple time check might ignore legitimate updates.
        // A more robust check might compare more fields, but for now, we'll allow updates.
    }
    
    this.lastTimestamps[timeframe] = candle.time;

    for (const subscriber of this.subscribers) {
      try {
        subscriber(payload);
      } catch (error) {
        console.error('Error in MarketDataBus subscriber:', error);
      }
    }
  }

  getSubscribersCount(): number {
    return this.subscribers.length;
  }
}

let busInstance: MarketDataBus;

if (process.env.NODE_ENV === 'development') {
  if (!globalThis.__WARROOM_RUNTIME__) {
    globalThis.__WARROOM_RUNTIME__ = {};
  }
  if (!globalThis.__WARROOM_RUNTIME__.marketDataBus) {
    globalThis.__WARROOM_RUNTIME__.marketDataBus = new MarketDataBus();
    console.log("War Room: Market Data Bus created and persisted to global runtime.");
  }
  busInstance = globalThis.__WARROOM_RUNTIME__.marketDataBus;
} else {
  busInstance = new MarketDataBus();
}

export const marketDataBus = busInstance;
