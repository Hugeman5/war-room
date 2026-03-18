'use client';

import { useState } from 'react';
import Header from '@/components/dashboard/header';
import MarketDataInitializer from './market-data-initializer';
import AdaptiveIntelligenceInitializer from './adaptive-intelligence-initializer';
import ReplayInitializer from './ReplayInitializer';
import NewsInitializer from './NewsInitializer';
import StoreBusConnector from './StoreBusConnector';
import DockableLayout from './DockableLayout';
import DiagnosticsInitializer from './DiagnosticsInitializer';
import IntelligenceFetcher from './IntelligenceFetcher';
import MarketEventInitializer from './market-event-initializer';
import BottomPanels from './bottom-panels';
import ChartAnalysisWorkspace from '../chart-analyzer/chart-analysis-workspace';

export default function Dashboard() {
  const [isChartFullscreen, setIsChartFullscreen] = useState(false);

  return (
    <div
      className="dashboard-grid-background flex h-screen w-screen flex-col bg-background font-body"
    >
      <StoreBusConnector />
      {/* The IntelligenceFetcher now handles the entire pipeline on the server-side */}
      <IntelligenceFetcher />
      {/* These initializers remain for real-time client-side data (live price, candles, news) */}
      <MarketDataInitializer />
      <AdaptiveIntelligenceInitializer />
      <ReplayInitializer />
      <NewsInitializer />
      <DiagnosticsInitializer />
      <MarketEventInitializer />

      <div className="p-2 md:p-4">
         <Header isChartFullscreen={isChartFullscreen} toggleChartFullscreen={() => setIsChartFullscreen(p => !p)} />
      </div>
      
      <main className="flex-1 grid grid-rows-[1fr_auto] gap-4 overflow-hidden px-2 md:px-4 pb-2 md:pb-4">
        {isChartFullscreen ? (
            <div className="overflow-hidden h-full">
                <ChartAnalysisWorkspace />
            </div>
        ) : (
            <>
                <div className="overflow-hidden">
                    <DockableLayout />
                </div>
                <div>
                    <BottomPanels />
                </div>
            </>
        )}
      </main>
    </div>
  );
}
