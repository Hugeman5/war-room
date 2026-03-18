
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { useTradeHistoryStore } from '@/store/tradeHistoryStore';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { Progress } from '../ui/progress';

function PanelSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-10 w-full" />
        </div>
    )
}

function DataRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
    return (
        <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">
                {label}
            </h3>
            <p className={cn("text-base font-medium text-foreground/90 font-mono", highlight && 'text-primary text-glow')}>
                {value}
            </p>
        </div>
    )
}

const WeightDistributionChart = () => {
    const weights = useTradeHistoryStore(state => state.adaptiveWeights);
    const data = Object.entries(weights).map(([name, value]) => ({ name, value }));

    return (
        <div>
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest mb-2">
                Signal Weight Distribution
            </h3>
            <div className="text-sm space-y-1">
                {data.sort((a,b) => b.value - a.value).map((entry, index) => (
                    <div key={entry.name} className="flex justify-between items-center">
                        <span className="text-muted-foreground capitalize">{entry.name.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <div className="flex items-center gap-2">
                            <span>{(entry.value * 100).toFixed(1)}%</span>
                            <div className="w-16 h-2 bg-muted rounded-full">
                               <div className="h-2 rounded-full bg-primary/50" style={{ width: `${entry.value * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function AdaptiveIntelPanel() {
  const { performance, tradeHistory } = useTradeHistoryStore();
  const { systemStatus } = useIntelligenceStore();
  const adaptiveEngineStatus = systemStatus.adaptiveEngine;

  const isLearning = adaptiveEngineStatus === 'LEARNING';
  const isActive = adaptiveEngineStatus === 'ACTIVE';
  const isReady = isActive || isLearning;

  return (
    <Card className="tactical-card border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        {!isReady ? (
          <div className="flex h-full min-h-[200px] items-center justify-center">
            <p className="text-center text-base text-muted-foreground">
              Initializing...
            </p>
          </div>
        ) : isLearning ? (
             <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                  <Bot className="h-8 w-8 text-primary mb-4 animate-pulse" />
                  <h3 className="tactical-title text-primary">LEARNING</h3>
                  <p className="text-base text-muted-foreground">
                    Awaiting sufficient trade history for optimization.
                  </p>
                  <p className="text-base font-mono font-bold text-foreground/90 mt-2">
                    {tradeHistory.length} / 20 Trades Collected
                  </p>
                  <Progress value={(tradeHistory.length / 20) * 100} className="w-3/4 mt-3 h-2" indicatorClassName="bg-primary" />
              </div>
        ) : (
          <div className="space-y-4">
            <div>
                 <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest mb-3">
                    Strategy Performance
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <DataRow label="Win Rate" value={`${performance.winRate}%`} highlight={performance.winRate > 50} />
                    <DataRow label="Total Trades" value={performance.totalTrades} />
                    <DataRow label="Profit Factor" value={performance.profitFactor} highlight={performance.profitFactor > 1.5} />
                    <DataRow label="Avg. R/R" value={`1:${performance.averageRR}`} />
                </div>
            </div>
             <WeightDistributionChart />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
