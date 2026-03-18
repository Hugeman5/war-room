
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { TrendingUp, TrendingDown, ShieldQuestion } from 'lucide-react';
import { formatPrice } from '@/lib/priceFormatter';

const DataRow = ({ label, value, highlight }: { label: string; value: string | number; highlight?: 'bullish' | 'bearish' }) => {
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
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-10 w-full mt-4" />
        </div>
    );
}

const NoTradePanel = ({ notes, confidence }: { notes: string, confidence: number }) => {
    return (
        <div className="flex flex-col items-center text-center p-4 min-h-[200px] justify-center">
            <ShieldQuestion className="h-10 w-10 text-primary mb-4 text-glow" />
            <h3 className="tactical-title text-primary/90">AI DECISION: HOLD</h3>
            <p className="mt-2 text-base text-muted-foreground max-w-sm">
                {notes}
            </p>
             <div className="mt-4">
                <DataRow label="Confidence" value={`${confidence}%`} />
             </div>
        </div>
    );
}


export default function DecisionContextPanel() {
    const { strategy } = useIntelligenceStore();

    if (!strategy) {
        return (
            <Card className="tactical-card h-full">
                <CardHeader>
                    <CardTitle className="tactical-title">Trade Plan</CardTitle>
                </CardHeader>
                <CardContent>
                    <PanelSkeleton />
                </CardContent>
            </Card>
        );
    }
    
    const { bias, confidence, entryZone, stopLoss, targets, strategyNotes } = strategy;

    if (bias === 'Neutral') {
       return (
            <Card className="tactical-card h-full">
                <CardHeader>
                    <CardTitle className="tactical-title">Trade Plan</CardTitle>
                </CardHeader>
                <CardContent>
                    <NoTradePanel notes={strategyNotes} confidence={confidence} />
                </CardContent>
            </Card>
        );
    }
    
    const isBullish = bias === 'LONG';
    const primaryTarget = targets && targets.length > 0 ? targets[0] : 0;
    const entryDisplay = entryZone && entryZone.length === 2 && entryZone[0] > 0 ? `${formatPrice(entryZone[0])} - ${formatPrice(entryZone[1])}` : 'Aggressive Entry';

    return (
        <Card className="tactical-card h-full flex flex-col">
            <CardHeader>
                <CardTitle className="tactical-title">Trade Plan</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto no-scrollbar">
                <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">
                            Bias
                        </h3>
                        <div className={cn(
                            "flex items-center gap-2 font-medium font-headline text-xl",
                            isBullish ? 'text-accent text-glow-accent' : 'text-destructive text-glow-destructive'
                        )}>
                            {isBullish ? <TrendingUp /> : <TrendingDown />}
                            {bias.toUpperCase()}
                        </div>
                    </div>
                    <DataRow label="Confidence" value={`${confidence}%`} highlight={isBullish ? 'bullish' : 'bearish'} />
                    <DataRow label="Entry Zone" value={entryDisplay} />
                    <DataRow label="Stop Loss" value={stopLoss ? formatPrice(stopLoss) : 'N/A'} />
                    <DataRow label="Target 1" value={primaryTarget ? formatPrice(primaryTarget) : 'N/A'} />
                </div>
                 <p className="text-base text-muted-foreground pt-4 !mt-5 border-t border-border">
                    {strategyNotes}
                </p>
            </CardContent>
        </Card>
    );
}
