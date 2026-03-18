
import type { CompletedTrade, StrategyPerformance, AdaptiveWeights } from '../schemas';

const DEFAULT_WEIGHTS: AdaptiveWeights = {
    marketStructure: 0.20,
    liquidityMap: 0.15,
    marketRegime: 0.10,
    orderBlocks: 0.10,
    smartMoney: 0.10,
    whaleIntelligence: 0.05,
    historicalAnalysis: 0.10,
    timeframeAlignment: 0.10,
    marketSentiment: 0.05,
    probabilityForecast: 0.05,
};

// --- Trade Outcome Analyzer ---
function analyzeTradeOutcomes(history: CompletedTrade[]): Record<keyof AdaptiveWeights, number> {
  const signalScores: Record<keyof AdaptiveWeights, { total: number, wins: number }> = {
    marketStructure: { total: 0, wins: 0 },
    liquidityMap: { total: 0, wins: 0 },
    marketRegime: { total: 0, wins: 0 },
    orderBlocks: { total: 0, wins: 0 },
    smartMoney: { total: 0, wins: 0 },
    whaleIntelligence: { total: 0, wins: 0 },
    historicalAnalysis: { total: 0, wins: 0 },
    timeframeAlignment: { total: 0, wins: 0 },
    marketSentiment: { total: 0, wins: 0 },
    probabilityForecast: { total: 0, wins: 0 },
  };

  for (const trade of history) {
      if (!trade.snapshot) continue;

      const isWin = trade.outcome === 'WIN';
      
      // A simple heuristic: if a signal was strong for a trade, we count it.
      if (trade.snapshot.marketStructure && (trade.snapshot.marketStructure.trend === 'bullish' || trade.snapshot.marketStructure.trend === 'bearish')) {
        signalScores.marketStructure.total++;
        if (isWin) signalScores.marketStructure.wins++;
      }
      if (trade.snapshot.liquidityMap && trade.snapshot.liquidityMap.sweepProbability > 0.6) {
        signalScores.liquidityMap.total++;
        if(isWin) signalScores.liquidityMap.wins++;
      }
      if (trade.snapshot.marketRegime && trade.snapshot.marketRegime.confidence > 0.7) {
        signalScores.marketRegime.total++;
        if(isWin) signalScores.marketRegime.wins++;
      }
      if (trade.snapshot.whaleIntelligence && trade.snapshot.whaleIntelligence.strength > 0.6) {
        signalScores.whaleIntelligence.total++;
        if(isWin) signalScores.whaleIntelligence.wins++;
      }
      if (trade.snapshot.marketSentiment && trade.snapshot.marketSentiment.confidence > 0.6) {
        signalScores.marketSentiment.total++;
        if(isWin) signalScores.marketSentiment.wins++;
      }
      // Add more heuristics for other signals...
  }

  const performance: Record<keyof AdaptiveWeights, number> = {} as any;
  for (const key in signalScores) {
      const typedKey = key as keyof AdaptiveWeights;
      const { total, wins } = signalScores[typedKey];
      performance[typedKey] = total > 0 ? wins / total : 0.5; // Default to 0.5 if no data
  }
  
  return performance;
}

// --- Signal Weight Optimizer ---
function optimizeSignalWeights(performance: Record<keyof AdaptiveWeights, number>, currentWeights: AdaptiveWeights): AdaptiveWeights {
  const newWeights = { ...currentWeights };
  let totalWeight = 1.0;
  
  for (const key in performance) {
      const typedKey = key as keyof AdaptiveWeights;
      const perf = performance[typedKey];
      const currentWeight = currentWeights[typedKey];
      
      // Adjust weight: if performance > 50%, increase weight, else decrease.
      const adjustment = (perf - 0.5) * 0.1; // Small learning rate
      let newWeight = currentWeight + adjustment;
      
      // Clamp the weight change to a max of 5% of its current value
      const maxChange = currentWeight * 0.05;
      newWeight = Math.max(currentWeight - maxChange, Math.min(currentWeight + maxChange, newWeight));
      
      newWeights[typedKey] = newWeight;
  }
  
  // Normalize weights to sum to 1
  const sumOfNewWeights = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
  for (const key in newWeights) {
      const typedKey = key as keyof AdaptiveWeights;
      newWeights[typedKey] /= sumOfNewWeights;
  }
  
  return newWeights;
}

// --- Strategy Performance Monitor ---
function monitorStrategyPerformance(history: CompletedTrade[]): StrategyPerformance {
    const totalTrades = history.length;
    if (totalTrades === 0) {
        return { totalTrades: 0, winRate: 0, profitFactor: 0, averageRR: 0, maxDrawdown: 0 };
    }

    const wins = history.filter(t => t.outcome === 'WIN');
    const losses = history.filter(t => t.outcome === 'LOSS');
    
    const winRate = (wins.length / totalTrades) * 100;
    
    const grossProfit = wins.reduce((sum, t) => sum + t.profitOrLoss, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.profitOrLoss, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    
    // Simplified RR and Drawdown
    const averageRR = history.reduce((sum, t) => {
        const risk = Math.abs(t.entryPrice - t.stopLoss);
        const reward = Math.abs(t.targets[0] - t.entryPrice);
        return sum + (reward / risk);
    }, 0) / totalTrades;

    return {
        totalTrades,
        winRate: parseFloat(winRate.toFixed(2)),
        profitFactor: parseFloat(profitFactor.toFixed(2)),
        averageRR: parseFloat(averageRR.toFixed(1)),
        maxDrawdown: 0, // Needs more complex calculation
    };
}


// --- Main Orchestrator for the Adaptive Cycle ---
export async function runAdaptiveCycle(
  tradeHistory: CompletedTrade[],
  currentWeights: AdaptiveWeights
): Promise<{ newWeights: AdaptiveWeights; performance: StrategyPerformance }> {
  console.log(`Running adaptive cycle with ${tradeHistory.length} trades.`);

  if (tradeHistory.length < 10) {
    console.log("Not enough trades for adaptive learning. Using default weights.");
    return { 
        newWeights: DEFAULT_WEIGHTS, 
        performance: monitorStrategyPerformance(tradeHistory) 
    };
  }

  const performanceReport = monitorStrategyPerformance(tradeHistory);
  const signalPerformance = analyzeTradeOutcomes(tradeHistory);
  const newWeights = optimizeSignalWeights(signalPerformance, currentWeights);
  
  console.log("Adaptive cycle complete. New weights calculated.");

  return { newWeights, performance: performanceReport };
}
