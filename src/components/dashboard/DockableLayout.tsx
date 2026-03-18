'use client';

import React from 'react';

// Import a curated set of essential panels
import ChartAnalysisWorkspace from '@/components/chart-analyzer/chart-analysis-workspace';
import TacticalSignalsPanel from '@/components/warroom/TacticalSignalsPanel';
import StrategyEnginePanel from '@/components/strategy-engine/strategy-engine-panel';
import ToolDock from '@/components/warroom/ToolDock';

export default function DockableLayout() {
  return (
    <div className="grid h-full grid-cols-12 gap-4">
      {/* Tactical Signals */}
      <div className="col-span-12 lg:col-span-2">
         <TacticalSignalsPanel />
      </div>

      {/* Chart Area */}
      <div className="col-span-12 lg:col-span-7">
        <ChartAnalysisWorkspace />
      </div>
      
      {/* Right Sidebar */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
        <StrategyEnginePanel />
        <ToolDock />
      </div>
    </div>
  );
}
