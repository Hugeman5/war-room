
import type { IntelligenceEngine, EngineResult } from "@/engines/types/Engine";
import { runFundingRatePressureEngine } from "@/intelligence/engines/fundingRatePressureEngine";
import { fetchFundingRateHistory } from "@/market/data";

export const FundingRatePressureEngine: IntelligenceEngine = {
  name: "FundingRatePressure",
  async run(): Promise<EngineResult> {
    const data = await fetchFundingRateHistory();
    return runFundingRatePressureEngine(data);
  },
};
