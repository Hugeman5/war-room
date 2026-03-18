'use client';

import { create } from 'zustand';
import type { CompletedTrade, StrategyPerformance, AdaptiveWeights } from '@/intelligence/schemas';

const DEFAULT_WEIGHTS: AdaptiveWeights = {
    marketStructure: 0.20,
    liquidityMap: 0.15,
    marketRegime: 0.10,
    orderBlocks: 0.10,
    smartMoney: 0.10,
    whaleIntelligence: 0.05,
    historicalAnalysis: 0.10,
    timeframeAlignment: 0.10,
    marketSentiment: 0.05,
    probabilityForecast: 0.05,
};

type TradeHistoryState = {
  tradeHistory: CompletedTrade[];
  performance: StrategyPerformance;
  adaptiveWeights: AdaptiveWeights;
  addCompletedTrade: (trade: CompletedTrade) => void;
  setTradeHistory: (trades: CompletedTrade[]) => void;
  updatePerformance: (performance: StrategyPerformance) => void;
  updateAdaptiveWeights: (weights: AdaptiveWeights) => void;
};

export const useTradeHistoryStore = create<TradeHistoryState>((set, get) => ({
  tradeHistory: [],
  performance: {
    totalTrades: 0,
    winRate: 0,
    profitFactor: 0,
    averageRR: 0,
    maxDrawdown: 0,
  },
  adaptiveWeights: DEFAULT_WEIGHTS,
  addCompletedTrade: (trade) =>
    set((state) => ({
      tradeHistory: [trade, ...state.tradeHistory].slice(0, 500), // Keep last 500 trades
    })),
  setTradeHistory: (trades) => set({ tradeHistory: trades }),
  updatePerformance: (performance) => set({ performance }),
  updateAdaptiveWeights: (weights) => set({ adaptiveWeights: weights }),
}));
