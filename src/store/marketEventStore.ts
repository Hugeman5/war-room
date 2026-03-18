
'use client';

import { create } from 'zustand';

export type BaseMarketEvent = {
  id: string;
  timestamp: number;
  priceLevel?: number;
  time: number;
};

export type VolatilityEvent = BaseMarketEvent & {
  type: 'VOLATILITY';
  impact: 'MEDIUM' | 'HIGH';
  content: string;
};

export type LiquidityEvent = BaseMarketEvent & {
  type: 'LIQUIDITY';
  impact: 'MEDIUM' | 'HIGH';
  content: string;
  details: {
    eventType: 'BOS' | 'CHOCH';
    direction: 'bullish' | 'bearish';
  }
};

export type WhaleEvent = BaseMarketEvent & {
  type: 'WHALE';
  impact: 'HIGH' | 'CRITICAL';
  content: string;
  details: {
    direction: 'exchange_inflow' | 'exchange_outflow';
    btcAmount: number;
    usdValue: number;
    walletAddress?: string;
    transactionHash?: string;
  };
};

export type LiquiditySweepEvent = BaseMarketEvent & {
  type: 'LIQUIDITY_SWEEP';
  impact: 'HIGH';
  content: string;
  details: {
    direction: 'buy-side' | 'sell-side';
    strength: number;
  }
};

export type SmartMoneyEvent = BaseMarketEvent & {
    type: 'SMART_MONEY',
    impact: 'MEDIUM' | 'HIGH',
    content: string;
    details: {
        activity: 'absorption' | 'accumulation' | 'distribution' | 'exhaustion';
        direction: 'bullish' | 'bearish';
        strength: number;
    }
}

export type MarketEvent = VolatilityEvent | LiquidityEvent | LiquiditySweepEvent | SmartMoneyEvent | WhaleEvent;

type MarketEventState = {
  events: MarketEvent[];
  addEvents: (newEvents: MarketEvent[]) => void;
};

const MAX_EVENTS = 500;

export const useMarketEventStore = create<MarketEventState>((set, get) => ({
  events: [],
  addEvents: (newEvents) => {
    if (newEvents.length === 0) return;
    const existingIds = new Set(get().events.map(e => e.id));
    const uniqueNewEvents = newEvents.filter(e => !existingIds.has(e.id));
    if (uniqueNewEvents.length === 0) return;
    
    const allEvents = [...uniqueNewEvents, ...get().events]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_EVENTS);
        
    set({ events: allEvents });
  },
}));
