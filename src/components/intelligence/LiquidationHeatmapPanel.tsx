
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/priceFormatter';

function PanelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );
}

function DataRow({ label, value, highlight }: { label: string; value: string | number; highlight?: 'bullish' | 'bearish' | 'neutral' | 'high' | 'moderate' | 'low' }) {
    const highlightClass = 
      highlight === 'bullish' ? 'text-accent text-glow-accent' 
      : highlight === 'bearish' ? 'text-destructive text-glow-destructive' 
      : highlight === 'high' ? 'text-destructive text-glow-destructive'
      : highlight === 'moderate' ? 'text-primary text-glow'
      : highlight === 'low' ? 'text-green-400'
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

export default function LiquidationHeatmapPanel() {
  const heatmap = useIntelligenceStore(state => state.liquidationHeatmap);

  const getZone = (clusters: {price: number, size: number}[]) => {
      if (!clusters || clusters.length === 0) return 'N/A';
      const prices = clusters.map(c => c.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return `${formatPrice(min)} - ${formatPrice(max)}`;
  }

  const shortZone = getZone(heatmap?.shortLiquidations ?? []);
  const longZone = getZone(heatmap?.longLiquidations ?? []);

  return (
    <Card className="tactical-card h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Liquidation Heatmap</CardTitle>
        <Flame className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {!heatmap ? (
          <PanelSkeleton />
        ) : (
          <div className="space-y-4">
            <DataRow 
                label="Short Liq. Zone" 
                value={shortZone}
                highlight='bearish'
            />
             <DataRow 
                label="Long Liq. Zone" 
                value={longZone}
                highlight='bullish'
            />
            <DataRow 
                label="Cluster Density" 
                value={heatmap.clusterDensity ?? 'N/A'}
                highlight={heatmap.clusterDensity === 'HIGH' ? 'high' : heatmap.clusterDensity === 'MEDIUM' ? 'moderate' : 'low'}
            />
            <DataRow 
                label="Cascade Risk" 
                value={`${heatmap.cascadeRiskScore ?? 0}%`}
                highlight={(heatmap.cascadeRiskScore ?? 0) > 70 ? 'high' : (heatmap.cascadeRiskScore ?? 0) > 40 ? 'moderate' : 'low'}
            />
             <p className="text-base text-muted-foreground pt-4 !mt-6">
                {heatmap.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
