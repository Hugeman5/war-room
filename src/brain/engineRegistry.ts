
import { IntelligenceEngine } from "@/engines/types/Engine"

import { OrderbookImbalanceEngine } from "@/engines/orderbook-imbalance"
import { LiquidationCascadeEngine } from "@/engines/liquidation-cascade"
import { OpenInterestShockEngine } from "@/engines/open-interest-shock"
import { FundingRatePressureEngine } from "@/engines/funding-rate-pressure"

export const engineRegistry: IntelligenceEngine[] = [
  OrderbookImbalanceEngine,
  LiquidationCascadeEngine,
  OpenInterestShockEngine,
  FundingRatePressureEngine
]
