'use client';

import { create } from 'zustand';
import type { Candle } from '@/lib/candle-builder';

export type ReplayScenario = 'FTX_COLLAPSE_2022' | 'COVID_CRASH_2020' | 'ETF_VOLATILITY_2024' | 'HIGH_VOL_RANGE';

export type ReplayState = {
  isActive: boolean;
  isPlaying: boolean;
  speed: number;
  progress: number; // 0-100
  scenario: ReplayScenario;
  historicalData: Candle[];
  currentIndex: number;

  actions: {
    toggleReplay: () => void;
    play: () => void;
    pause: () => void;
    setSpeed: (speed: number) => void;
    setScenario: (scenario: ReplayScenario) => void;
    loadData: (data: Candle[]) => void;
    tick: (increment: number) => void;
    reset: () => void;
  };
};

export const useReplayStore = create<ReplayState>((set, get) => ({
  isActive: false,
  isPlaying: false,
  speed: 1,
  progress: 0,
  scenario: 'FTX_COLLAPSE_2022',
  historicalData: [],
  currentIndex: 0,
  actions: {
    toggleReplay: () => set(state => ({ isActive: !state.isActive, isPlaying: false, progress: 0, currentIndex: 0 })),
    play: () => set(state => ({ isPlaying: state.historicalData.length > 0 ? true : false })),
    pause: () => set({ isPlaying: false }),
    setSpeed: (speed) => set({ speed }),
    setScenario: (scenario) => set({ scenario, currentIndex: 0, progress: 0, isPlaying: false, historicalData: [] }),
    loadData: (data) => set({ historicalData: data, currentIndex: 0, progress: 0 }),
    tick: (increment) => {
      const { historicalData, currentIndex } = get();
      const newIndex = Math.min(currentIndex + increment, historicalData.length - 1);
      const progress = (newIndex / (historicalData.length -1)) * 100;
      set({ currentIndex: newIndex, progress });
      if (newIndex >= historicalData.length -1) {
          set({ isPlaying: false });
      }
    },
    reset: () => set({ currentIndex: 0, progress: 0, isPlaying: false }),
  }
}));
