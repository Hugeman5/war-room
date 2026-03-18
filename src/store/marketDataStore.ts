
'use client';

import { create } from 'zustand';
import type { BtcCandle, Trade } from '@/market/data';
import type { Candle, Timeframe } from '@/lib/candle-builder';

export type NewsItem = {
  title: string;
  source: string;
  link: string;
  isoDate: string;
  summary: string;
};

type MarketDataState = {
  btcPrice: number | null;
  isFeedConnected: boolean;
  btcCandles: BtcCandle[];
  marketNews: NewsItem[];
  recentTrades: Trade[];
  candles1m: Candle[];
  candles5m: Candle[];
  candles15m: Candle[];
  candles30m: Candle[];
  candles1h: Candle[];
  candles4h: Candle[];
  candles1d: Candle[];
  setPrice: (price: number | null) => void;
  setFeedStatus: (isConnected: boolean) => void;
  setCandles: (candles: BtcCandle[]) => void;
  setNews: (news: NewsItem[]) => void;
  addTrade: (trade: Trade) => void;
  setCandlesForTimeframe: (timeframe: Timeframe, candles: Candle[]) => void;
};

export const useMarketDataStore = create<MarketDataState>((set, get) => ({
  btcPrice: null,
  isFeedConnected: false,
  btcCandles: [],
  marketNews: [],
  recentTrades: [],
  candles1m: [],
  candles5m: [],
  candles15m: [],
  candles30m: [],
  candles1h: [],
  candles4h: [],
  candles1d: [],
  setPrice: (price) => set({ btcPrice: price }),
  setFeedStatus: (isConnected) => set({ isFeedConnected: isConnected }),
  setCandles: (candles) => set({ btcCandles: candles }),
  setNews: (news) => set({ marketNews: news }),
  addTrade: (trade) => {
    const trades = [trade, ...get().recentTrades].slice(0, 100);
    set({ recentTrades: trades });
  },
  setCandlesForTimeframe: (timeframe, candles) => {
    switch (timeframe) {
      case '1m':
        set({ candles1m: candles });
        break;
      case '5m':
        set({ candles5m: candles });
        break;
      case '15m':
        set({ candles15m: candles });
        break;
      case '30m':
        set({ candles30m: candles });
        break;
      case '1h':
        set({ candles1h: candles });
        break;
      case '4h':
        set({ candles4h: candles });
        break;
      case '1d':
        set({ candles1d: candles });
        break;
    }
  },
}));
