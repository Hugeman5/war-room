
'use client';

import { create } from 'zustand';

const LATENCY_HISTORY_LIMIT = 100;

export type LatencyMetrics = {
  feedLatency: number;
  intelligenceLatency: number;
  strategyLatency: number;
  uiRenderLatency: number;
  totalLatency: number;
  engineLatencies: Record<string, number>;
};

type LatencyState = {
  latest: LatencyMetrics;
  history: number[]; // Storing only total latency for history
  avgLatency: number;
  peakLatency: number;
  setLatency: (metrics: Partial<Omit<LatencyMetrics, 'totalLatency'>>) => void;
};

export const useLatencyStore = create<LatencyState>((set, get) => ({
  latest: {
    feedLatency: 0,
    intelligenceLatency: 0,
    strategyLatency: 0,
    uiRenderLatency: 0,
    totalLatency: 0,
    engineLatencies: {},
  },
  history: [],
  avgLatency: 0,
  peakLatency: 0,
  setLatency: (newMetrics) => {
    const currentState = get().latest;
    const updatedState = { ...currentState, ...newMetrics };

    // The intelligenceLatency from the fetcher is the total API roundtrip.
    // The actual pipeline total is provided separately in engineLatencies.
    const pipelineTotal = updatedState.engineLatencies?.pipelineTotal || updatedState.intelligenceLatency;
    
    const totalLatency = 
      updatedState.feedLatency + 
      pipelineTotal + 
      updatedState.uiRenderLatency;
    
    updatedState.totalLatency = totalLatency;
    updatedState.intelligenceLatency = pipelineTotal;


    const history = [totalLatency, ...get().history].slice(0, LATENCY_HISTORY_LIMIT);
    const avgLatency = history.reduce((a, b) => a + b, 0) / history.length;
    const peakLatency = Math.max(...history);

    set({ 
      latest: updatedState,
      history,
      avgLatency,
      peakLatency,
    });
  },
}));
