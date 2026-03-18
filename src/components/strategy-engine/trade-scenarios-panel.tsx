
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/priceFormatter';
import type { TradeScenario } from '@/intelligence/schemas';

function DataRow({ label, value, highlight }: { label: string; value: string | number; highlight?: string; }) {
    let highlightClass = '';
    if (highlight) {
        if (highlight.toLowerCase().includes('bullish') || highlight.toLowerCase().includes('long') || highlight.toLowerCase().includes('demand')) {
        highlightClass = 'text-accent text-glow-accent';
        } else if (highlight.toLowerCase().includes('bearish') || highlight.toLowerCase().includes('short') || highlight.toLowerCase().includes('supply')) {
        highlightClass = 'text-destructive text-glow-destructive';
        } else {
        highlightClass = 'text-primary text-glow';
        }
    }

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

export default function TradeScenariosPanel() {
    const { tradeScenarios, isAnalyzing } = useIntelligenceStore();
    const scenarios = tradeScenarios || [];
    const primary = scenarios[0];

    return (
        <Card className="tactical-card flex flex-col h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                <CardTitle className="tactical-title">
                    Trade Scenarios
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent>
                {isAnalyzing && !primary ? (
                    <Skeleton className="h-24 w-full" />
                ) : !primary ? (
                    <div className="text-center text-base text-muted-foreground h-full flex items-center justify-center">No scenarios generated.</div>
                ) : (
                    <div className="space-y-3">
                         <div className="space-y-3 font-mono">
                            <DataRow label="Scenario" value={primary.scenario} highlight={primary.scenario} />
                            <DataRow label="Probability" value={`${(primary.probability * 100).toFixed(0)}%`} />
                            {primary.entry && <DataRow label="Optimal Entry" value={formatPrice(primary.entry)} />}
                            {primary.stopLoss && <DataRow label="Invalidation" value={formatPrice(primary.stopLoss)} />}
                            {primary.target && <DataRow label="Target" value={formatPrice(primary.target)} />}
                        </div>
                        <p className="mt-3 text-base text-muted-foreground whitespace-pre-wrap pt-3 border-t border-border">
                            {primary.rationale}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
