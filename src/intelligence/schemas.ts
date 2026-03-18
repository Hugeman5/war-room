

import { z } from 'zod';
import type { RiskLevel, TradeMode } from '@/types/engineTypes';

// --- Type-safe consts for Zod enums ---
const riskLevels: [RiskLevel, ...RiskLevel[]] = ['LOW', 'MODERATE', 'HIGH'];
const tradeModes: [TradeMode, ...TradeMode[]] = ['NORMAL', 'DEFENSIVE', 'HALTED'];


// Base Schemas for Pipeline Components
const SwingPointSchema = z.object({
  time: z.number(),
  price: z.number(),
  type: z.enum(['high', 'low']),
});
export type SwingPoint = z.infer<typeof SwingPointSchema>;

const MarketStructureEventSchema = z.object({
  id: z.string(),
  type: z.enum(['BOS', 'CHOCH']),
  direction: z.enum(['bullish', 'bearish']),
  price: z.number(),
  time: z.number(),
});
export type MarketStructureEvent = z.infer<typeof MarketStructureEventSchema>;

export const MarketStructureSchema = z.object({
  trend: z.enum(['bullish', 'bearish', 'sideways']),
  swingPoints: z.array(SwingPointSchema),
  events: z.array(MarketStructureEventSchema),
  lastHigh: SwingPointSchema.nullable(),
  lastLow: SwingPointSchema.nullable(),
  strength: z.number().optional(),
});
export type MarketStructure = z.infer<typeof MarketStructureSchema>;

// L3 Engine: Market Regime
export const MarketRegimeSchema = z.object({
  regime: z.enum(['TRENDING', 'RANGING', 'BREAKOUT', 'ACCUMULATION', 'DISTRIBUTION']),
  confidence: z.number().describe("Confidence score for the detected regime."),
  volatilityState: z.enum(['EXPANDING', 'COMPRESSING', 'NORMAL']).optional(),
  volatilityScore: z.number().optional().describe("0-100 score of market volatility."),
  trendStrength: z.number().optional().describe("0-100 score of trend strength."),
});
export type MarketRegime = z.infer<typeof MarketRegimeSchema>;

// L3 Engine: Order Blocks
const SingleOrderBlockSchema = z.object({
  priceRange: z.tuple([z.number(), z.number()]).describe("The [low, high] price range of the block."),
  time: z.number(),
  status: z.enum(['active', 'mitigated']),
});
export type SingleOrderBlock = z.infer<typeof SingleOrderBlockSchema>;

export const OrderBlocksSchema = z.object({
    bullish: z.array(SingleOrderBlockSchema).describe("Demand zones (bullish order blocks)."),
    bearish: z.array(SingleOrderBlockSchema).describe("Supply zones (bearish order blocks)."),
    activeBlockCount: z.number().optional().describe("The count of unmitigated order blocks."),
    strength: z.number().optional().describe("Significance of the detected blocks (0-100)."),
});
export type OrderBlocks = z.infer<typeof OrderBlocksSchema>;

// L3 Engine: Smart Money
export const SmartMoneySchema = z.object({
    activity: z.enum(['accumulation', 'distribution', 'absorption', 'none']),
    strength: z.number().describe("Strength of the detected institutional activity (0-1)."),
});
export type SmartMoney = z.infer<typeof SmartMoneySchema>;

// NEW: Whale Intelligence Engine
export const WhaleIntelligenceSchema = z.object({
    dominantActivity: z.enum(['exchange_inflow', 'exchange_outflow', 'none']),
    strength: z.number().describe("Strength of the detected whale activity (0-1)."),
    netflow: z.number().describe("Net flow in USD over the period. Positive is inflow, negative is outflow."),
});
export type WhaleIntelligence = z.infer<typeof WhaleIntelligenceSchema>;

// NEW: Orderbook Imbalance Engine
export const OrderbookImbalanceSchema = z.object({
  imbalance: z.number().describe("Buy/Sell pressure imbalance (-1 to 1)."),
  side: z.enum(["buy", "sell", "neutral"])
});
export type OrderbookImbalance = z.infer<typeof OrderbookImbalanceSchema>;

// NEW: Liquidation Cascade Engine
export const LiquidationCascadeSchema = z.object({
  detected: z.boolean(),
  direction: z.enum(["long", "short", "none"]),
  intensity: z.number(),
});
export type LiquidationCascade = z.infer<typeof LiquidationCascadeSchema>;

// NEW: Open Interest Shock Engine
export const OpenInterestShockSchema = z.object({
  shock: z.boolean(),
  direction: z.enum(["increase", "decrease", "stable"]),
  magnitude: z.number(),
});
export type OpenInterestShock = z.infer<typeof OpenInterestShockSchema>;

// NEW: Funding Rate Pressure Engine
export const FundingRatePressureSchema = z.object({
  pressure: z.enum(["long", "short", "neutral"]),
  fundingRate: z.number(),
  extreme: z.boolean(),
});
export type FundingRatePressure = z.infer<typeof FundingRatePressureSchema>;


// NEW: Liquidation Heatmap Engine
export const LiquidationClusterSchema = z.object({
  price: z.number(),
  size: z.number().describe("Estimated size of the liquidation cluster."),
});
export type LiquidationCluster = z.infer<typeof LiquidationClusterSchema>;

export const LiquidationHeatmapSchema = z.object({
  longLiquidations: z.array(LiquidationClusterSchema).describe("Clusters of potential long liquidations below current price."),
  shortLiquidations: z.array(LiquidationClusterSchema).describe("Clusters of potential short liquidations above current price."),
  clusterDensity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  cascadeRiskScore: z.number().optional(),
  description: z.string(),
});
export type LiquidationHeatmap = z.infer<typeof LiquidationHeatmapSchema>;


// L4 Predictive Intelligence Schemas
export const MultiTimeframeAlignmentSchema = z.object({
  alignment: z.enum(['bullish', 'bearish', 'mixed']),
  strength: z.number().describe("Strength of the alignment (0-1)."),
});
export type MultiTimeframeAlignment = z.infer<typeof MultiTimeframeAlignmentSchema>;

export const MacroEventSchema = z.object({
  macroRisk: z.enum(riskLevels),
  riskDirection: z.enum(['RISK_ON', 'RISK_OFF', 'NEUTRAL']),
  event: z.string().describe("Name of the upcoming event."),
  impactLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']),
  direction: z.enum(['BULLISH_BTC', 'BEARISH_BTC', 'NEUTRAL']),
  volatilityExpectation: z.enum(['LOW', 'NORMAL', 'ELEVATED']),
});
export type MacroEvent = z.infer<typeof MacroEventSchema>;

export const MarketSentimentSchema = z.object({
  sentiment: z.enum(['bullish', 'bearish', 'neutral']),
  confidence: z.number().describe("Confidence in the sentiment reading (0-1)."),
});
export type MarketSentiment = z.infer<typeof MarketSentimentSchema>;

export const ProbabilityForecastSchema = z.object({
  tradeProbability: z.number().describe("Estimated success probability for a trade in the current context (0-1)."),
  probabilityLong: z.number().optional(),
  probabilityShort: z.number().optional(),
});
export type ProbabilityForecast = z.infer<typeof ProbabilityForecastSchema>;


export const LiquidityMapSchema = z.object({
  liquidityAbove: z.number(),
  liquidityBelow: z.number(),
  equalHighs: z.boolean(),
  equalLows: z.boolean(),
  nearestPool: z.enum(['above', 'below']),
  density: z.enum(['low', 'medium', 'high']),
  sweepProbability: z.number(),
  stopClusters: z.object({
    above: z.number(),
    below: z.number(),
  }),
  description: z.string(),
});
export type LiquidityMap = z.infer<typeof LiquidityMapSchema>;

export const ChartAnalysisOutputSchema = z.object({
  trend: z.string().describe('The overall market trend (e.g., Uptrend, Downtrend, Sideways).'),
  support: z.array(z.number()).describe('Key support price levels.'),
  resistance: z.array(z.number()).describe('Key resistance price levels.'),
  breakoutStructure: z.string().describe('Any identified breakout structure (e.g., Bull Flag, Bear Flag, Triangle).'),
  keyInsights: z.string().describe('A summary of key insights and potential market implications.'),
});
export type ChartAnalysisOutput = z.infer<typeof ChartAnalysisOutputSchema>;

export const HistoricalAnalysisOutputSchema = z.object({
  pattern: z.string(),
  similarityScore: z.coerce.number(),
  historicalReference: z.string(),
  triggerEvent: z.string(),
  expertBehavior: z.string(),
  whaleActivity: z.string().optional(),
  sentimentScore: z.coerce.number().optional(),
  marketContext: z.string(),
  volatilityRegime: z.string().optional(),
  historicalMove: z.string(),
  outcomeProbability: z.coerce.number(),
  expectedOutcome: z.string()
});
export type HistoricalAnalysisOutput = z.infer<typeof HistoricalAnalysisOutputSchema>;

export const DocumentAnalysisOutputSchema = z.object({
  summary: z.string().describe("Short summary of the analyzed document."),
  keyTopics: z.array(z.string()).describe("Key topics or themes extracted from the document."),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  insights: z.string().describe("Important insights extracted from the document."),
});
export type DocumentAnalysisOutput = z.infer<typeof DocumentAnalysisOutputSchema>;

// NEW: AI Inference Schema
export const AIBiasOutputSchema = z.object({
  aiBias: z.enum(['Bullish', 'Bearish', 'Neutral']).describe("Your primary directional bias based on the data."),
  confidence: z.number().min(0).max(1).describe("Your confidence in this bias, from 0.0 to 1.0."),
  tradeDirection: z.enum(['LONG', 'SHORT', 'HOLD']).describe("The specific trading action you recommend."),
  reasoning: z.string().describe("A brief, one-sentence explanation for your decision.")
});
export type AIBiasOutput = z.infer<typeof AIBiasOutputSchema>;


// NEW: Alpha Layer Schemas
export const AlphaSignalSchema = z.object({
  name: z.enum(['WhaleTracker', 'LiquidationHeatmap', 'FundingPressure', 'OpenInterestShock', 'OptionsGamma']),
  signal: z.enum(['bullish', 'bearish', 'neutral']),
  strength: z.number().describe("0-1, how strong is the phenomenon"),
  confidence: z.number().describe("0-1, how confident are we in the signal"),
});
export type AlphaSignal = z.infer<typeof AlphaSignalSchema>;

export const AlphaLayerOutputSchema = z.object({
    alphaScore: z.number().describe("Aggregated score from all alpha engines (-1 to 1)."),
    signals: z.array(AlphaSignalSchema),
});
export type AlphaLayerOutput = z.infer<typeof AlphaLayerOutputSchema>;


// Engine Status Schema for System Health
export const EngineStatusSchema = z.enum(['IDLE', 'PENDING', 'ACTIVE', 'DEGRADED', 'FAILED', 'DISABLED', 'LEARNING']);
export type SystemStatusValue = z.infer<typeof EngineStatusSchema>;

const SystemHealthSchema = z.object({
  feed: EngineStatusSchema.optional(),
  dataLoader: EngineStatusSchema.optional(),
  orchestrator: EngineStatusSchema.optional(),
  structureEngine: EngineStatusSchema.optional(),
  liquidityEngine: EngineStatusSchema.optional(),
  liquidationEngine: EngineStatusSchema.optional(),
  marketRegimeEngine: EngineStatusSchema.optional(),
  orderBlockEngine: EngineStatusSchema.optional(),
  smartMoneyEngine: EngineStatusSchema.optional(),
  historicalEngine: EngineStatusSchema.optional(),
  multiTimeframeEngine: EngineStatusSchema.optional(),
  macroEventEngine: EngineStatusSchema.optional(),
  marketSentimentEngine: EngineStatusSchema.optional(),
  probabilityForecastEngine: EngineStatusSchema.optional(),
  adaptiveEngine: EngineStatusSchema.optional(),
  strategyEngine: EngineStatusSchema.optional(),
  masterAIBrain: EngineStatusSchema.optional(),
  aiBroker: EngineStatusSchema.optional(),
  replayEngine: EngineStatusSchema.optional(),
  whaleEngine: EngineStatusSchema.optional(),
  orderbookImbalanceEngine: EngineStatusSchema.optional(),
  liquidationCascadeEngine: EngineStatusSchema.optional(),
  openInterestShockEngine: EngineStatusSchema.optional(),
  fundingRatePressureEngine: EngineStatusSchema.optional(),
  battlefieldEngine: EngineStatusSchema.optional(),
  signalConfidenceEngine: EngineStatusSchema.optional(),
  riskEnvironmentEngine: EngineStatusSchema.optional(),
  tacticalContextEngine: EngineStatusSchema.optional(),
  alphaLayer: EngineStatusSchema.optional(),
  aiInferenceEngine: EngineStatusSchema.optional(),
});
export type SystemStatus = z.infer<typeof SystemHealthSchema>;

export const RiskEnvironmentSchema = z.object({
  riskLevel: z.enum(riskLevels),
  tradeMode: z.enum(tradeModes),
  recommendedPositionSize: z.number().describe("Position size modifier (e.g., 1.0 for normal, 0.5 for defensive)."),
  notes: z.string(),
});
export type RiskEnvironment = z.infer<typeof RiskEnvironmentSchema>;

// --- MASTER AI BRAIN & SUB-MODULE SCHEMAS ---

export const BattlefieldStateSchema = z.object({
  marketState: z.string().describe("A fused description of the market, e.g., 'Bullish Trend, Expanding Volatility'"),
  volatility: z.enum(['EXPANDING', 'COMPRESSING', 'NORMAL', 'LOW', 'HIGH']),
  liquidityPosition: z.string().describe("Description of price relative to key liquidity, e.g., 'Approaching Buyside Liquidity'"),
  smartMoneyActivity: z.enum(['ACCUMULATION', 'DISTRIBUTION', 'ABSORPTION', 'NONE']),
  confidenceScore: z.number().describe("Overall confidence in the current state assessment (0-1)."),
});
export type BattlefieldState = z.infer<typeof BattlefieldStateSchema>;

export const TacticalContextSchema = z.object({
  environment: z.enum(['BREAKOUT_ENVIRONMENT', 'TREND_CONTINUATION', 'RANGE_ENVIRONMENT', 'REVERSAL_ENVIRONMENT', 'NO_TRADE_ZONE']),
  rationale: z.string(),
});
export type TacticalContext = z.infer<typeof TacticalContextSchema>;

export const SignalConfidenceSchema = z.object({
  longConfidence: z.number(),
  shortConfidence: z.number(),
  finalConfidence: z.number(),
  dominantBias: z.enum(['Bullish', 'Bearish', 'Neutral']),
});
export type SignalConfidence = z.infer<typeof SignalConfidenceSchema>;

export const TradeScenarioSchema = z.object({
  scenario: z.string().describe("Name of the scenario, e.g., 'BREAKOUT_LONG'"),
  probability: z.number(),
  entry: z.number().optional(),
  stopLoss: z.number().optional(),
  target: z.number().optional(),
  rationale: z.string(),
});
export type TradeScenario = z.infer<typeof TradeScenarioSchema>;

export const MasterAIBrainOutputSchema = z.object({
  status: z.enum(["READY", "NO_SETUP", "HALTED"]),
  decision: z.string().describe("The final decision or action recommended."),
  confidence: z.number().describe("The confidence score for this decision."),
  commentary: z.string().describe("The reasoning behind the decision."),
});
export type MasterAIBrainOutput = z.infer<typeof MasterAIBrainOutputSchema>;

// --- STRATEGY & TRADE SCHEMAS ---

export const CommandConsoleOutputSchema = z.object({
  marketBias: z.enum(['Bullish', 'Bearish', 'Neutral']),
  confidence: z.number(),
  totalScore: z.number(),
  primaryScenario: z.string(),
  alternativeScenario: z.string(),
  invalidationLevel: z.string(),
  signalBreakdown: z.record(z.object({
    score: z.number(),
    reason: z.string(),
  })),
});
export type CommandConsoleOutput = z.infer<typeof CommandConsoleOutputSchema>;


export const AIReviewSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  commentary: z.string().describe("Your concise reasoning for the decision."),
});

// Final output of the Strategy Engine
export const StrategyOutputSchema = z.object({
    bias: z.string().describe('The final recommended trade bias (e.g., "Bullish", "Bearish", "Neutral").'),
    confidence: z.coerce.number().describe('A single confidence score for the proposed trade bias (0-100).'),
    entryZone: z.array(z.number()).optional().describe('An array representing the ideal price range for entry, e.g., [67000, 67500].'),
    stopLoss: z.coerce.number().optional().describe('A single price level for the stop-loss order.'),
    targets: z.array(z.number()).optional().describe('An array of price targets, e.g., [69000, 71000].'),
    riskRewardRatio: z.string().optional().describe('The calculated risk/reward ratio as a string, e.g., "1:2.5".'),
    strategyNotes: z.string().describe('A detailed explanation for the generated trade plan, or the rationale for a "Neutral" bias.'),
    positionSize: z.string().optional().describe('Calculated position size based on mock portfolio.'),
    maxRisk: z.string().optional().describe('Maximum monetary risk for the trade.'),
    stopDistance: z.string().optional().describe('The distance of the stop loss from the entry in percentage.'),
    capitalExposure: z.string().optional().describe('The total capital exposed in this trade.'),
    volatilityLevel: z.string().optional(),
    bullProbability: z.coerce.number().describe('Probability of a bullish outcome (0-100).'),
    bearProbability: z.coerce.number().describe('Probability of a bearish outcome (0-100).'),
    consolidationProbability: z.coerce.number().describe('Probability of a market consolidation (0-100).'),
    breakoutProbability: z.coerce.number().describe('Probability of a market breakout (0-100).'),
    signalScore: z.number().optional().describe('The deterministic signal fusion score (0-100).'),
    aiDecision: z.string().optional().describe('The decision from the AI Broker review layer (APPROVE, REJECT).'),
    aiCommentary: z.string().optional().describe('The commentary from the AI Broker.'),
    aiBrokerStatus: z.enum(['ACTIVE', 'FAILED', 'DISABLED']).optional().describe('Status of the AI Broker review layer.'),
    timestamp: z.number().optional().describe('The timestamp of the intelligence snapshot used to generate this strategy.'),
});
export type StrategyOutput = z.infer<typeof StrategyOutputSchema>;


// L5 - Adaptive Intelligence Schemas
export const CompletedTradeSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  bias: z.enum(['Bullish', 'Bearish']),
  entryPrice: z.number(),
  stopLoss: z.number(),
  targets: z.array(z.number()),
  outcome: z.enum(['WIN', 'LOSS']),
  profitOrLoss: z.number(),
  snapshot: z.any(), // Changed from IntelligenceSnapshotSchema.partial() to any to decouple from direct Zod dependency
});
export type CompletedTrade = z.infer<typeof CompletedTradeSchema>;

export const StrategyPerformanceSchema = z.object({
  totalTrades: z.number(),
  winRate: z.number(),
  profitFactor: z.number(),
  averageRR: z.number(),
  maxDrawdown: z.number(),
});
export type StrategyPerformance = z.infer<typeof StrategyPerformanceSchema>;

export const AdaptiveWeightsSchema = z.record(z.number());
export type AdaptiveWeights = z.infer<typeof AdaptiveWeightsSchema>;

export type VectorMatch = {
  period: string;
  similarity: number;
};


// Intelligence Snapshot (The Canonical Object)
export interface IntelligenceSnapshot {
  // --- Core Intelligence Inputs ---
  timestamp: number;
  marketStructure?: MarketStructure;
  liquidityMap?: LiquidityMap;
  liquidationHeatmap?: LiquidationHeatmap;
  orderBlocks?: OrderBlocks;
  smartMoney?: SmartMoney;
  whaleIntelligence?: WhaleIntelligence;
  orderbookImbalance?: OrderbookImbalance;
  timeframeAlignment?: MultiTimeframeAlignment;
  marketSentiment?: MarketSentiment;
  macroEvents?: MacroEvent;
  historicalAnalysis?: HistoricalAnalysisOutput;
  probabilityForecast?: ProbabilityForecast;
  marketRegime?: MarketRegime;
  liquidationCascade?: LiquidationCascade;
  openInterestShock?: OpenInterestShock;
  fundingRatePressure?: FundingRatePressure;
  alphaLayer?: AlphaLayerOutput;
  aiInference?: AIBiasOutput;

  // --- Brain Module Outputs ---
  battlefieldState?: BattlefieldState;
  signalConfidence?: SignalConfidence;
  riskEnvironment?: RiskEnvironment;
  tacticalContext?: TacticalContext;
  
  // --- Strategy & Decision Outputs ---
  tradeScenarios?: TradeScenario[];
  masterAIBrainOutput?: MasterAIBrainOutput;
  strategy?: StrategyOutput; // Final actionable plan
}

export type FullSnapshot = Partial<IntelligenceSnapshot> & {
  // --- Audit & Diagnostics ---
  systemStatus?: Partial<SystemStatus>;
  engineLatencies?: Record<string, number>;
}
