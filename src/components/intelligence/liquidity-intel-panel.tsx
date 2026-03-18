
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, TrendingUp, TrendingDown } from 'lucide-react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { formatPrice } from '@/lib/priceFormatter';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

function DataRow({ label, value, highlight }: { label: string; value: string | number; highlight?: 'bullish' | 'bearish' | 'neutral' }) {
    const highlightClass = 
        highlight === 'bullish' ? 'text-accent text-glow-accent' 
      : highlight === 'bearish' ? 'text-destructive text-glow-destructive' 
      : 'text-foreground/90';

    return (
        <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">
                {label}
            </h3>
            <p className={cn("text-base font-medium font-mono", highlightClass)}>
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
      <Skeleton className="h-5 w-full" />
    </div>
  )
}

export default function LiquidityIntelPanel() {
  const { liquidityMap: map, orderbookImbalance } = useIntelligenceStore();

  return (
    <Card className="tactical-card h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Liquidity Map</CardTitle>
        <Waves className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {!map ? (
          <PanelSkeleton />
        ) : (
          <div className="space-y-3 font-mono">
            <DataRow 
                label="Liquidity Above" 
                value={formatPrice(map.liquidityAbove)}
                highlight='bearish'
            />
            <DataRow 
                label="Liquidity Below" 
                value={formatPrice(map.liquidityBelow)}
                highlight='bullish'
            />
             <DataRow 
                label="Equal High Cluster" 
                value={map.equalHighs ? 'YES' : 'NO'}
                highlight={map.equalHighs ? 'bearish' : 'neutral'}
            />
             <DataRow 
                label="Equal Low Cluster" 
                value={map.equalLows ? 'YES' : 'NO'}
                highlight={map.equalLows ? 'bullish' : 'neutral'}
            />
            {orderbookImbalance && (
              <>
                <DataRow 
                    label="OB Side" 
                    value={orderbookImbalance.side.toUpperCase()}
                    highlight={orderbookImbalance.side === 'buy' ? 'bullish' : orderbookImbalance.side === 'sell' ? 'bearish' : 'neutral'}
                />
                <DataRow 
                    label="OB Pressure" 
                    value={`${(Math.abs(orderbookImbalance.imbalance) * 100).toFixed(0)}%`}
                    highlight={orderbookImbalance.side === 'buy' ? 'bullish' : orderbookImbalance.side === 'sell' ? 'bearish' : 'neutral'}
                />
              </>
            )}
            <DataRow
                label="Liquidity Score"
                value={`${(map.sweepProbability * 100).toFixed(0)}%`}
                highlight={map.sweepProbability > 0.6 ? 'bullish' : 'neutral'}
            />
             <p className="text-base text-muted-foreground pt-2 !mt-4">
                {map.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
