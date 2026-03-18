
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { formatPrice } from '@/lib/priceFormatter';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

function DataRow({ label, value, highlight }: { label: string; value: string; highlight?: 'bullish' | 'bearish' | 'neutral' }) {
    const highlightClass = highlight === 'bullish' ? 'text-primary' : highlight === 'bearish' ? 'text-destructive' : '';
    return (
        <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">
                {label}
            </h3>
            <p className={cn("text-base font-medium text-foreground/90 font-mono", highlightClass)}>
                {value}
            </p>
        </div>
    )
}

function PanelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  )
}

export default function MarketStructurePanel() {
  const structure = useIntelligenceStore((state) => state.marketStructure);

  const getTrendLabel = () => {
    if (!structure) return 'ANALYZING';
    switch (structure.trend) {
        case 'bullish': return 'UPTREND';
        case 'bearish': return 'DOWNTREND';
        default: return 'RANGE';
    }
  }
  
  const getTrendIcon = () => {
    if (structure?.trend === 'bullish') return <TrendingUp className="h-4 w-4 text-primary" />;
    if (structure?.trend === 'bearish') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Landmark className="h-4 w-4 text-accent" />;
  }

  return (
    <Card className="tactical-card h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Market Structure</CardTitle>
        <Network className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {!structure ? (
          <PanelSkeleton />
        ) : (
          <div className="space-y-3 font-mono">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">
                  TREND
              </h3>
              <div className={cn(
                  "flex items-center gap-2 font-medium",
                  structure.trend === 'bullish' && 'text-primary text-glow',
                  structure.trend === 'bearish' && 'text-destructive text-glow-destructive',
                  structure.trend === 'sideways' && 'text-accent'
                )}>
                {getTrendIcon()}
                <span className="text-base">{getTrendLabel()}</span>
              </div>
            </div>
             <DataRow 
                label="Last Swing High" 
                value={structure.lastHigh ? formatPrice(structure.lastHigh.price) : 'N/A'}
                highlight={'bullish'}
             />
             <DataRow 
                label="Last Swing Low" 
                value={structure.lastLow ? formatPrice(structure.lastLow.price) : 'N/A'}
                highlight={'bearish'}
             />
             <DataRow 
                label="Structure Strength" 
                value={structure.strength !== undefined ? `${structure.strength}%` : 'N/A'} 
             />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
