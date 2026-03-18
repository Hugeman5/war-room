
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

function PanelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">
                {label}
            </h3>
            <p className="mt-1 text-base font-medium text-foreground/90 font-mono">
                {value}
            </p>
        </div>
    )
}

export default function HistoricalIntelPanel() {
  const { historicalAnalysis, isAnalyzing, analysisStatus } = useIntelligenceStore();

  const getStatusMessage = () => {
    switch (analysisStatus) {
      case 'analyzing-chart':
        return 'Analyzing live market structure...';
      case 'generating-insights':
        return 'Comparing with historical scenarios...';
      case 'complete':
        return 'Analysis complete.';
      case 'error':
        return 'Historical analysis failed.';
      case 'idle':
      default:
        return 'Awaiting market data...';
    }
  }

  return (
    <Card className="tactical-card h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Historical Scenario Match</CardTitle>
        <History className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {isAnalyzing && analysisStatus !== 'complete' ? (
          <PanelSkeleton />
        ) : !historicalAnalysis ? (
          <div className="flex h-full min-h-[150px] items-center justify-center">
            <p className="text-center text-base text-muted-foreground">
              { getStatusMessage() }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <DataRow label="Pattern" value={historicalAnalysis.pattern ?? 'N/A'} />
            <Separator className="bg-primary/20" />
            <DataRow label="Historical Reference" value={historicalAnalysis.historicalReference ?? 'N/A'} />
            <Separator className="bg-primary/20" />
            <DataRow label="Trigger Event" value={historicalAnalysis.triggerEvent ?? 'N/A'} />
            <Separator className="bg-primary/20" />
            <DataRow label="Institutional Behavior" value={historicalAnalysis.expertBehavior ?? 'N/A'} />
             <Separator className="bg-primary/20" />
            <DataRow label="Whale Activity" value={historicalAnalysis.whaleActivity ?? "Unknown"} />
            <Separator className="bg-primary/20" />
            <DataRow label="Historical Move" value={historicalAnalysis.historicalMove ?? "Unknown"} />
            <Separator className="bg-primary/20" />
            <div>
                 <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">
                    Outcome Probability
                </h3>
                <p className="mt-1 text-base font-medium text-primary text-glow font-mono">
                    {historicalAnalysis.outcomeProbability ?? 0}%
                </p>
            </div>
            <Separator className="bg-primary/20" />
            <div>
                 <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">
                    Expected Outcome
                </h3>
                <p className="mt-2 text-base text-muted-foreground">
                    {historicalAnalysis.expectedOutcome ?? 'N/A'}
                </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
