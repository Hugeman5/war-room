
'use client';

import { useIntelligenceStore }from '@/store/intelligenceStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Anchor, Flame, Gauge, Zap, Atom } from 'lucide-react';
import type { AlphaSignal, AlphaSignalName } from '@/alpha/types';

const SignalIcon = ({ name }: { name: AlphaSignalName }) => {
    const iconMap: Record<AlphaSignalName, React.ElementType> = {
        WhaleTracker: Anchor,
        LiquidationHeatmap: Flame,
        FundingPressure: Gauge,
        OpenInterestShock: Zap,
        OptionsGamma: Atom,
    };
    const Icon = iconMap[name] || Anchor;
    return <Icon className="h-4 w-4 text-muted-foreground" />;
};

const SignalRow = ({ signal }: { signal: AlphaSignal }) => {
    const { name, signal: direction, strength, confidence } = signal;

    const isNeutral = direction === 'neutral' || strength < 0.1;
    const isBullish = direction === 'bullish';

    const colorClass = isNeutral
        ? 'text-muted-foreground'
        : isBullish
        ? 'text-accent'
        : 'text-destructive';

    const glowClass = isNeutral
        ? ''
        : isBullish
        ? 'text-glow-accent'
        : 'text-glow-destructive';

    const formattedName = name.replace(/([A-Z])/g, ' $1').trim();

    return (
        <div className="flex items-center justify-between p-2 rounded-md bg-card/30 border border-transparent hover:border-border/50 hover:bg-card/70 transition-colors">
            <div className="flex items-center gap-3">
                <SignalIcon name={name} />
                <span className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">{formattedName}</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-sm">
                 <div className={cn("w-20 text-center font-bold", colorClass, glowClass)}>
                    {direction.toUpperCase()}
                </div>
                <div className="w-16 text-right">
                    <span>S: </span>
                    <span>{(strength * 100).toFixed(0)}%</span>
                </div>
                 <div className="w-16 text-right">
                    <span>C: </span>
                    <span>{(confidence * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );
};

export default function AlphaIntelPanel() {
    const { alphaLayer } = useIntelligenceStore();

    if (!alphaLayer || !alphaLayer.signals) {
        return (
            <div className="space-y-2 p-1">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    
    const { alphaScore, signals } = alphaLayer;

    const scoreColor = alphaScore > 0.1 ? 'text-accent text-glow-accent' : alphaScore < -0.1 ? 'text-destructive text-glow-destructive' : 'text-primary';

    return (
        <div>
             <div className="flex items-baseline justify-between mb-4 px-2">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">
                    Aggregated Alpha
                </h3>
                <p className={cn("text-lg font-medium font-mono", scoreColor)}>
                    {(alphaScore * 100).toFixed(1)}
                </p>
            </div>
            <div className="space-y-2">
                {signals.map(s => <SignalRow key={s.name} signal={s} />)}
            </div>
        </div>
    );
}
