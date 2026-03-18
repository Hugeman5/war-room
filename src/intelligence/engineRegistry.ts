
export const ENGINE_REGISTRY: Record<string, string> = {
    // System & Diagnostics
    "feed": "Binance Feed",
    "dataLoader": "Data Loader",
    "orchestrator": "Orchestrator",
    "replayEngine": "Replay Engine",

    // Core Market Analysis
    "structureEngine": "Structure Engine",
    "liquidityEngine": "Liquidity Engine",
    "liquidationEngine": "Liquidation Engine",
    "marketRegimeEngine": "Market Regime",
    "orderBlockEngine": "Order Blocks",
    "smartMoneyEngine": "Smart Money",
    "whaleEngine": "Whale Radar",

    // Derivatives Analysis
    "orderbookImbalanceEngine": "Orderbook Imbalance",
    "liquidationCascadeEngine": "Liquidation Cascade",
    "openInterestShockEngine": "Open Interest Shock",
    "fundingRatePressureEngine": "Funding Rate",
    
    // Alpha Layer
    "alphaLayer": "Alpha Engine Layer",
    "aiInferenceEngine": "AI Inference Engine",

    // Predictive & Contextual Analysis
    "multiTimeframeEngine": "Multi-Timeframe",
    "macroEventEngine": "Macro Event Engine",
    "marketSentimentEngine": "Sentiment Engine",
    "historicalEngine": "Historical Engine",
    "probabilityForecastEngine": "Forecast Engine",

    // Brain & Decision Pipeline
    "battlefieldEngine": "Battlefield Situation",
    "signalConfidenceEngine": "Signal Confidence",
    "riskEnvironmentEngine": "Risk Environment",
    "tacticalContextEngine": "Tactical Context",
    "masterAIBrain": "Master AI Brain",
    "strategyEngine": "Strategy Engine",
    "adaptiveEngine": "Adaptive Engine",
    "aiBroker": "AI Broker",
};

export const defaultEngineStatus = Object.fromEntries(
  Object.keys(ENGINE_REGISTRY).map(e => [e, "IDLE"])
);
