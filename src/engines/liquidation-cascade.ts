
import type { IntelligenceEngine, EngineResult } from "@/engines/types/Engine";
import { runLiquidationCascadeEngine } from "@/intelligence/engines/liquidationCascadeEngine";
import { fetchLiquidations } from "@/market/data";

export const LiquidationCascadeEngine: IntelligenceEngine = {
  name: "LiquidationCascade",
  async run(): Promise<EngineResult> {
    const data = await fetchLiquidations();
    return runLiquidationCascadeEngine(data);
  },
};
