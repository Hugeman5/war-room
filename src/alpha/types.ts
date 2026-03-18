
export type AlphaSignalName = 'WhaleTracker' | 'LiquidationHeatmap' | 'FundingPressure' | 'OpenInterestShock' | 'OptionsGamma';

export type AlphaSignal = {
  name: AlphaSignalName;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1, how strong is the phenomenon
  confidence: number; // 0-1, how confident are we in the signal
};

export interface AlphaEngine {
  name: AlphaSignalName;
  run: () => Promise<Omit<AlphaSignal, 'name'>>;
}

export type AlphaLayerOutput = {
    alphaScore: number;
    signals: AlphaSignal[];
}
