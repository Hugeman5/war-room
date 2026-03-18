
import type { IntelligenceEngine, EngineResult } from "@/engines/types/Engine";
import { runOrderbookImbalanceEngine } from "@/intelligence/engines/orderbookImbalanceEngine";
import { fetchBTCOrderBook } from "@/market/data";

export const OrderbookImbalanceEngine: IntelligenceEngine = {
  name: "OrderbookImbalance",
  async run(): Promise<EngineResult> {
    const data = await fetchBTCOrderBook();
    return runOrderbookImbalanceEngine(data);
  },
};
