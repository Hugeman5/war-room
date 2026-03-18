export type EngineSignal = "BUY" | "SELL" | "NEUTRAL";

export type EngineResult = {
  engine: string;
  signal: EngineSignal;
  confidence: number;
  weight: number;
  reason?: string;
  timestamp: number;
};

export interface IntelligenceEngine {
  name: string;
  run(): Promise<EngineResult> | EngineResult;
}
