'use client';

import { create } from 'zustand';

export type BtcDataPoint = {
  date: string;
  price: number;
  market_cap: number;
  volume: number;
};

type BtcHistoryState = {
  btcHistory: BtcDataPoint[];
  currentBtcPrice: number | null;
  setHistory: (history: BtcDataPoint[]) => void;
  setLivePrice: (price: number | null) => void;
  getBTCPriceOnDate: (date: Date) => BtcDataPoint | null;
  getHistoricalWindow: (startDate: Date, endDate: Date) => BtcDataPoint[];
};

export const useBtcHistoryStore = create<BtcHistoryState>((set, get) => ({
  btcHistory: [],
  currentBtcPrice: null,
  setHistory: (history) => set({ btcHistory: history }),
  setLivePrice: (price) => set({ currentBtcPrice: price }),
  getBTCPriceOnDate: (date: Date) => {
    const { btcHistory } = get();
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const record = btcHistory.find(
      (d) => {
        const recordDate = new Date(d.date);
        recordDate.setUTCHours(0,0,0,0);
        return recordDate.getTime() === targetDate.getTime();
      }
    );
    return record || null;
  },
  getHistoricalWindow: (startDate: Date, endDate: Date) => {
    const { btcHistory } = get();
    return btcHistory.filter(
      (d) => {
        const recordDate = new Date(d.date);
        return recordDate >= startDate && recordDate <= endDate;
      }
    );
  },
}));
