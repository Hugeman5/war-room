
export interface EngineResult {
  engine: string;
  signal: "BUY" | "SELL" | "NEUTRAL";
  confidence: number; // 0 to 1
  weight: number; // 0 to 1
  reason?: string;
  timestamp: number;
}
