
'use client';

import { create } from 'zustand';
import type { 
    StrategyOutput, 
    CommandConsoleOutput, 
    SystemStatus, 
    SystemStatusValue, 
    MasterAIBrainOutput,
    TradeScenario,
    MarketStructure,
    LiquidityMap,
    LiquidationHeatmap,
    HistoricalAnalysisOutput,
    MarketRegime,
    OrderBlocks,
    SmartMoney,
    WhaleIntelligence,
    OrderbookImbalance,
    MultiTimeframeAlignment,
    MacroEvent,
    MarketSentiment,
    ProbabilityForecast,
    FullSnapshot,
    BattlefieldState,
    TacticalContext,
    SignalConfidence,
    RiskEnvironment,
    LiquidationCascade,
    OpenInterestShock,
    FundingRatePressure,
    AlphaLayerOutput,
    AIBiasOutput
} from '@/intelligence/schemas';
import { defaultEngineStatus } from '@/intelligence/engineRegistry';

export type AnalysisStatus =
  | 'idle'
  | 'analyzing-chart'
  | 'generating-insights'
  | 'complete'
  | 'error';

export type OverallSystemStatus = 'initializing' | 'live' | 'degraded' | 'critical' | 'idle';

export type { SystemStatus, SystemStatusValue };

type IntelligenceState = {
  isAnalyzing: boolean;
  isPipelineActive: boolean;
  analysisStatus: AnalysisStatus;
  systemStatus: Partial<SystemStatus>;
  overallStatus: OverallSystemStatus;
  timestamp: number | null;

  // Decomposed Snapshot State
  marketStructure: MarketStructure | null;
  liquidityMap: LiquidityMap | null;
  liquidationHeatmap: LiquidationHeatmap | null;
  historicalAnalysis: HistoricalAnalysisOutput | null;
  marketRegime: MarketRegime | null;
  orderBlocks: OrderBlocks | null;
  smartMoney: SmartMoney | null;
  whaleIntelligence: WhaleIntelligence | null;
  orderbookImbalance: OrderbookImbalance | null;
  liquidationCascade: LiquidationCascade | null;
  openInterestShock: OpenInterestShock | null;
  fundingRatePressure: FundingRatePressure | null;
  timeframeAlignment: MultiTimeframeAlignment | null;
  macroEvents: MacroEvent | null;
  marketSentiment: MarketSentiment | null;
  probabilityForecast: ProbabilityForecast | null;
  alphaLayer: AlphaLayerOutput | null;
  aiInference: AIBiasOutput | null;
  
  // Brain module outputs
  battlefieldState: BattlefieldState | null;
  tacticalContext: TacticalContext | null;
  signalConfidence: SignalConfidence | null;
  riskEnvironment: RiskEnvironment | null;

  // Higher Level Outputs
  masterAIBrainOutput: MasterAIBrainOutput | null;
  commandConsoleOutput: CommandConsoleOutput | null;
  strategy: StrategyOutput | null;
  tradeScenarios: TradeScenario[] | null;
  
  // Setters
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setSystemStatus: (engine: keyof SystemStatus, status: SystemStatusValue) => void;
  setFullSystemStatus: (status: Partial<SystemStatus>) => void;
  setOverallStatus: (status: OverallSystemStatus) => void;
  togglePipeline: () => void;
  
  // New atomic update function
  setFullSnapshot: (snapshot: FullSnapshot) => void;
  
  resetSystemStatus: () => void;
};

const initialSystemStatus: Partial<SystemStatus> = {
  ...defaultEngineStatus,
  feed: 'PENDING',
  dataLoader: 'PENDING',
  replayEngine: 'DISABLED',
};

export const useIntelligenceStore = create<IntelligenceState>((set, get) => ({
  isAnalyzing: false,
  isPipelineActive: true,
  analysisStatus: 'idle',
  systemStatus: initialSystemStatus,
  overallStatus: 'idle',
  timestamp: null,

  // Decomposed state
  marketStructure: null,
  liquidityMap: null,
  liquidationHeatmap: null,
  historicalAnalysis: null,
  marketRegime: null,
  orderBlocks: null,
  smartMoney: null,
  whaleIntelligence: null,
  orderbookImbalance: null,
  liquidationCascade: null,
  openInterestShock: null,
  fundingRatePressure: null,
  timeframeAlignment: null,
  macroEvents: null,
  marketSentiment: null,
  probabilityForecast: null,
  alphaLayer: null,
  aiInference: null,
  
  // Brain module outputs
  battlefieldState: null,
  tacticalContext: null,
  signalConfidence: null,
  riskEnvironment: null,

  masterAIBrainOutput: null,
  commandConsoleOutput: null,
  strategy: null,
  tradeScenarios: null,
  
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalysisStatus: (status) => set({ analysisStatus: status }),
  setSystemStatus: (engine, status) => {
    if (get().systemStatus[engine] === 'FAILED' && status === 'PENDING') return;
    set(state => ({
      systemStatus: { ...state.systemStatus, [engine]: status }
    }));
  },
  setFullSystemStatus: (systemStatus) => set({ systemStatus }),
  setOverallStatus: (status) => {
    if (get().overallStatus !== status) {
        set({ overallStatus: status, timestamp: Date.now() });
    }
  },
  togglePipeline: () => {
    const wasActive = get().isPipelineActive;
    if (wasActive) {
      // Toggling OFF
      set(state => ({
        isPipelineActive: false,
        overallStatus: 'idle',
        systemStatus: {
          ...initialSystemStatus,
          feed: state.systemStatus.feed, // Preserve feed and replay status
          replayEngine: state.systemStatus.replayEngine,
        },
        isAnalyzing: false,
      }));
    } else {
      // Toggling ON
      set({
        isPipelineActive: true,
        overallStatus: 'initializing',
      });
    }
  },
  setFullSnapshot: (snapshot) => set(state => ({
    marketStructure: snapshot.marketStructure || null,
    liquidityMap: snapshot.liquidityMap || null,
    liquidationHeatmap: snapshot.liquidationHeatmap || null,
    historicalAnalysis: snapshot.historicalAnalysis || null,
    marketRegime: snapshot.marketRegime || null,
    orderBlocks: snapshot.orderBlocks || null,
    smartMoney: snapshot.smartMoney || null,
    whaleIntelligence: snapshot.whaleIntelligence || null,
    orderbookImbalance: snapshot.orderbookImbalance || null,
    liquidationCascade: snapshot.liquidationCascade || null,
    openInterestShock: snapshot.openInterestShock || null,
    fundingRatePressure: snapshot.fundingRatePressure || null,
    timeframeAlignment: snapshot.timeframeAlignment || null,
    macroEvents: snapshot.macroEvents || null,
    marketSentiment: snapshot.marketSentiment || null,
    probabilityForecast: snapshot.probabilityForecast || null,
    alphaLayer: snapshot.alphaLayer || null,
    aiInference: snapshot.aiInference || null,
    battlefieldState: snapshot.battlefieldState || null,
    tacticalContext: snapshot.tacticalContext || null,
    signalConfidence: snapshot.signalConfidence || null,
    riskEnvironment: snapshot.riskEnvironment || null,
    masterAIBrainOutput: snapshot.masterAIBrainOutput || null,
    strategy: snapshot.strategy || null,
    tradeScenarios: snapshot.tradeScenarios || null,
    timestamp: snapshot.timestamp ?? Date.now(),
    systemStatus: snapshot.systemStatus ? { ...state.systemStatus, ...snapshot.systemStatus } : state.systemStatus,
  })),
  
  resetSystemStatus: () => set({ 
    systemStatus: { 
      ...initialSystemStatus, 
      feed: get().systemStatus.feed, 
      replayEngine: get().systemStatus.replayEngine ?? 'DISABLED' 
    } 
  }),
}));
