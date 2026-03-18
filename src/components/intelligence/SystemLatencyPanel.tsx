
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useLatencyStore } from '@/store/latencyStore';
import { useMarketDataStore } from '@/store/marketDataStore';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

function getLatencyColor(latency: number): 'accent' | 'primary' | 'destructive' {
  if (latency > 1000) return 'destructive';
  if (latency > 500) return 'primary';
  return 'accent';
}

function LatencyRow({ label, value }: { label: string; value: number }) {
  const color = getLatencyColor(value);
  const colorClass = {
    accent: 'text-accent',
    primary: 'text-primary',
    destructive: 'text-destructive',
  }[color];

  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono font-medium", colorClass)}>
        {value.toFixed(0)} ms
      </span>
    </div>
  );
}

function StatusRow({ label, value, isOk }: { label: string; value: string; isOk: boolean }) {
  const colorClass = isOk ? 'text-accent' : 'text-destructive';
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono font-medium", colorClass)}>
        {value}
      </span>
    </div>
  );
}


export default function SystemLatencyPanel() {
  const { latest, avgLatency, peakLatency } = useLatencyStore();
  const { isFeedConnected } = useMarketDataStore();

  const totalColor = getLatencyColor(latest.totalLatency);
  const indicatorColorClass = `bg-${totalColor}`;

  return (
    <Card className="tactical-card border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="space-y-2">
          <StatusRow label="WebSocket" value={isFeedConnected ? 'ONLINE' : 'OFFLINE'} isOk={isFeedConnected} />
          <LatencyRow label="Market Feed" value={latest.feedLatency} />
          <LatencyRow label="Intelligence Stack" value={latest.intelligenceLatency} />
          <LatencyRow label="Strategy & AI" value={latest.strategyLatency} />
          <LatencyRow label="UI Render" value={latest.uiRenderLatency} />
          
          <div className="pt-2">
             <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">
                    Total Latency
                </h3>
                <p className={cn("text-base font-medium text-foreground/90 font-mono", {
                    'text-accent text-glow-accent': totalColor === 'accent',
                    'text-primary text-glow': totalColor === 'primary',
                    'text-destructive text-glow-destructive': totalColor === 'destructive',
                })}>
                    {latest.totalLatency.toFixed(0)} ms
                </p>
            </div>
            <Progress value={(latest.totalLatency / 1500) * 100} className="h-2 mt-1" indicatorClassName={indicatorColorClass} />
          </div>

           <div className="pt-2 text-sm space-y-1 font-mono">
               <div className="flex justify-between text-muted-foreground">
                   <span>Avg (100 runs):</span>
                   <span>{avgLatency.toFixed(0)} ms</span>
               </div>
                <div className="flex justify-between text-muted-foreground">
                   <span>Peak (100 runs):</span>
                   <span>{peakLatency.toFixed(0)} ms</span>
               </div>
           </div>

        </div>
      </CardContent>
    </Card>
  );
}
