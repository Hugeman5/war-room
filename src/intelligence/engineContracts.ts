import type {
  MarketStructure,
  LiquidityMap,
  HistoricalAnalysisOutput,
  MarketRegime,
  OrderBlocks,
  SmartMoney,
  MultiTimeframeAlignment,
  MacroEvent,
  MarketSentiment,
  ProbabilityForecast,
} from './schemas';

export type EngineContracts = {
  structureEngine: MarketStructure;
  liquidityEngine: LiquidityMap;
  marketRegimeEngine: MarketRegime;
  orderBlockEngine: OrderBlocks;
  smartMoneyEngine: SmartMoney;
  multiTimeframeEngine: MultiTimeframeAlignment;
  macroEventEngine: MacroEvent;
  marketSentimentEngine: MarketSentiment;
  historicalEngine: HistoricalAnalysisOutput;
  probabilityForecastEngine: ProbabilityForecast;
};
