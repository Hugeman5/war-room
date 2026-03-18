import { useMarketDataStore } from '@/store/marketDataStore';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { useLatencyStore } from '@/store/latencyStore';
import { formatPrice } from '@/lib/priceFormatter';

export function runWarRoomDiagnostics() {
  const marketDataState = useMarketDataStore.getState();
  const intelligenceState = useIntelligenceStore.getState();
  const latencyState = useLatencyStore.getState();

  const report: string[] = [];

  report.push("=== 🛡️ WAR ROOM SYSTEM DIAGNOSTICS 🛡️ ===");
  report.push("\n--- Market Data Pipeline ---");
  report.push(`Market Feed Status: ${marketDataState.isFeedConnected ? 'ONLINE' : 'OFFLINE'}`);
  report.push(`WebSocket Latency: ${latencyState.latest.feedLatency.toFixed(0)}ms`);
  const lastTrade = marketDataState.recentTrades[0];
  report.push(`Last Market Tick Time: ${lastTrade ? lastTrade.time : 'N/A'}`);
  
  const lastCandle = marketDataState.candles15m.length > 0 ? marketDataState.candles15m[marketDataState.candles15m.length - 1] : null;
  const candleBuilderStatus = marketDataState.isFeedConnected && lastCandle ? 'ACTIVE' : 'INACTIVE';
  report.push(`Candle Builder Status: ${candleBuilderStatus}`);
  report.push(`Last 15m Candle Time: ${lastCandle ? new Date(lastCandle.time * 1000).toLocaleTimeString() : 'N/A'}`);
  report.push(`Last 15m Candle Close: ${lastCandle ? formatPrice(lastCandle.close) : 'N/A'}`);
  
  report.push("\n--- Intelligence Engines ---");
  if (intelligenceState.systemStatus && latencyState.latest.engineLatencies) {
      const engines = Object.keys(intelligenceState.systemStatus)
        .filter(key => !['feed', 'dataLoader', 'orchestrator', 'replayEngine'].includes(key));
      
      for (const engine of engines) {
          const status = intelligenceState.systemStatus[engine as keyof typeof intelligenceState.systemStatus];
          const duration = latencyState.latest.engineLatencies[engine];
          
          const safeStatus = status ?? "UNKNOWN";
          
          report.push(`${engine.padEnd(25)}: ${safeStatus.padEnd(10)} (${duration !== undefined ? `${duration.toFixed(0)}ms` : 'N/A'})`);
      }
  } else {
      report.push("Engine status unavailable.");
  }
  
  report.push("\n--- Intelligence Snapshot ---");
  if (intelligenceState.timestamp && intelligenceState.marketStructure) {
      report.push(`Snapshot Status: AVAILABLE`);
      report.push(`Snapshot Timestamp: ${new Date(intelligenceState.timestamp).toLocaleString()}`);
  } else {
      report.push("Snapshot Status: INTELLIGENCE SNAPSHOT MISSING");
  }
  
  report.push("\n--- Strategy Engine ---");
  const strategy = intelligenceState.strategy;
  const riskEnvironment = intelligenceState.riskEnvironment;
  if (strategy) {
      report.push(`Strategy Engine Status: ${intelligenceState.systemStatus.strategyEngine}`);
      report.push(`Signal Bias: ${strategy.bias}`);
      report.push(`Confidence: ${strategy.confidence}%`);
      report.push(`Strategy Mode: ${riskEnvironment?.tradeMode || 'N/A'}`);
  } else {
      report.push("Strategy Engine: INACTIVE");
  }

  report.push("\n--- AI Broker ---");
  if (strategy && strategy.aiBrokerStatus) {
      report.push(`AI Broker Status: ${strategy.aiBrokerStatus}`);
      report.push(`Trade Plan: ${strategy.aiDecision || 'WAIT'}`);
  } else {
      report.push("AI Broker: INACTIVE");
  }
  
  report.push("\n--- Overall System Health ---");
  let healthStatus = 'HEALTHY';
  if (!marketDataState.isFeedConnected) {
      healthStatus = 'CRITICAL (Feed Offline)';
  } else if (!intelligenceState.timestamp || !intelligenceState.marketStructure) {
      healthStatus = 'DEGRADED (Snapshot Missing)';
  } else if (!strategy || (strategy.aiBrokerStatus !== 'ACTIVE' && strategy.aiBrokerStatus !== 'DISABLED')) {
      healthStatus = 'WARNING (Broker/Strategy Inactive)';
  }
  report.push(`Pipeline Status: ${healthStatus}`);
  
  report.push("\n========================================");

  console.log(report.join('\n'));
}
