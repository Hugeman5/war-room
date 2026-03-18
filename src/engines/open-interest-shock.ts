
import type { IntelligenceEngine, EngineResult } from "@/engines/types/Engine";
import { runOpenInterestShockEngine } from "@/intelligence/engines/openInterestShockEngine";
import { fetchOpenInterestHistory } from "@/market/data";

export const OpenInterestShockEngine: IntelligenceEngine = {
  name: "OpenInterestShock",
  async run(): Promise<EngineResult> {
    const data = await fetchOpenInterestHistory();
    return runOpenInterestShockEngine(data);
  },
};
