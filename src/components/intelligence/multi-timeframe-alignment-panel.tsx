
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitMerge, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

function PanelSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
        </div>
    )
}

export default function MultiTimeframeAlignmentPanel() {
  const { timeframeAlignment, isAnalyzing } = useIntelligenceStore();
  const alignment = timeframeAlignment;

  const TrendIcon = ({ trend }: { trend?: 'bullish' | 'bearish' | 'mixed' }) => {
    if (trend === 'bullish') return <TrendingUp className="h-4 w-4 text-primary" />;
    if (trend === 'bearish') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-accent" />;
  }

  return (
    <Card className="tactical-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">HTF Alignment</CardTitle>
        <GitMerge className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isAnalyzing && !alignment ? (
          <PanelSkeleton />
        ) : !alignment ? (
          <div className="text-center text-sm text-muted-foreground">Awaiting data...</div>
        ) : (
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-widest">
                    HTF Bias
                </h3>
                <Badge 
                    variant={alignment.alignment === 'bullish' ? 'default' : alignment.alignment === 'bearish' ? 'destructive' : 'secondary'}
                    className={cn("text-base", alignment.alignment === 'mixed' && 'bg-accent text-accent-foreground')}
                >
                    <div className="flex items-center gap-2">
                        <TrendIcon trend={alignment.alignment} />
                        {alignment.alignment.toUpperCase()}
                    </div>
                </Badge>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
