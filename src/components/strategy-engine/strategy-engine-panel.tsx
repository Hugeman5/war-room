
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, TrendingDown, ShieldQuestion } from 'lucide-react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/priceFormatter';
import { Skeleton } from '../ui/skeleton';

const DataRow = ({ label, value, highlight }: { label: string; value: string | number; highlight?: 'bullish' | 'bearish' | 'high' | 'moderate' | 'low' | 'neutral' }) => {
    const highlightClass = 
      highlight === 'bullish' ? 'text-accent text-glow-accent' 
      : highlight === 'bearish' ? 'text-destructive text-glow-destructive' 
      : highlight === 'high' ? 'text-destructive text-glow-destructive'
      : highlight === 'moderate' ? 'text-primary text-glow'
      : highlight === 'low' ? 'text-accent text-glow-accent'
      : highlight === 'neutral' ? 'text-primary text-glow'
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
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-10 w-full mt-4" />
        </div>
    );
}

const NoTradePanel = ({ notes, confidence, riskLevel }: { notes: string, confidence: number, riskLevel: string }) => {
    return (
        <div className="flex flex-col items-center text-center p-4 min-h-[200px] justify-center">
            <ShieldQuestion className="h-10 w-10 text-primary mb-4 text-glow" />
            <h3 className="tactical-title text-primary/90">ACTION: HOLD</h3>
             <div className="mt-4 space-y-3 w-full">
                <DataRow label="Confidence" value={`${confidence}%`} highlight={'neutral'} />
                <DataRow label="Risk Level" value={riskLevel} highlight={riskLevel.toLowerCase() as any} />
             </div>
            <p className="mt-4 text-base text-muted-foreground max-w-sm">
                {notes}
            </p>
        </div>
    );
}

export default function StrategyEnginePanel() {
  const { strategy, riskEnvironment } = useIntelligenceStore();
  
  if (!strategy || !riskEnvironment) {
    return (
         <Card className="tactical-card flex flex-col h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                <CardTitle className="tactical-title">
                    AI Trade Decision
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
                <PanelSkeleton />
            </CardContent>
        </Card>
    )
  }
  
  const { bias, confidence, entryZone, stopLoss, targets, strategyNotes } = strategy;
  const { riskLevel } = riskEnvironment;
  
  const isNeutral = bias === 'Neutral';
  if (isNeutral) {
      return (
        <Card className="tactical-card flex flex-col h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                <CardTitle className="tactical-title">
                    AI Trade Decision
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                 <NoTradePanel notes={strategyNotes} confidence={confidence} riskLevel={riskLevel} />
            </CardContent>
        </Card>
      )
  }

  const isBullish = bias === 'LONG';
  const primaryTarget = targets && targets.length > 0 ? targets[0] : 0;
  const entryDisplay = entryZone && entryZone.length === 2 && entryZone[0] > 0 ? `${formatPrice(entryZone[0])} - ${formatPrice(entryZone[1])}` : 'Aggressive Market Entry';

  const ActionIcon = isBullish ? TrendingUp : TrendingDown;
  const actionColor = isBullish ? 'text-accent text-glow-accent' : 'text-destructive text-glow-destructive';

  return (
    <Card className="tactical-card flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="tactical-title">
            AI Trade Decision
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">
                  Action
              </h3>
              <div className={cn("flex items-center gap-2 font-medium font-headline text-xl", actionColor)}>
                  <ActionIcon />
                  {isBullish ? 'LONG' : 'SHORT'}
              </div>
          </div>
          <DataRow label="Confidence" value={`${confidence}%`} highlight={isBullish ? 'bullish' : 'bearish'} />
          <DataRow label="Risk Level" value={riskLevel} highlight={riskLevel.toLowerCase() as any} />
          <DataRow label="Entry Price" value={entryDisplay} />
          <DataRow label="Stop Loss" value={stopLoss ? formatPrice(stopLoss) : 'N/A'} />
          <DataRow label="Target Price" value={primaryTarget ? formatPrice(primaryTarget) : 'N/A'} />
          
           <p className="text-base text-muted-foreground pt-4 !mt-5 border-t border-border">
              {strategyNotes}
          </p>
      </CardContent>
    </Card>
  );
}
