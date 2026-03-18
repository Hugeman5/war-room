
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { useLatencyStore } from '@/store/latencyStore';
import { cn } from '@/lib/utils';
import { Zap, Waves, Flame, Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const SignalCard = ({
    title,
    Icon,
    signal,
    confidence,
    latency,
    status
}: {
    title: string;
    Icon: React.ElementType;
    signal: 'BUY' | 'SELL' | 'NEUTRAL';
    confidence: number;
    latency: number;
    status: string;
}) => {
    const isNeutral = signal === 'NEUTRAL' || status !== 'ACTIVE';
    const isBuy = signal === 'BUY';
    
    const colorClass = isNeutral
        ? 'text-muted-foreground'
        : isBuy
        ? 'text-accent'
        : 'text-destructive';

    const glowClass = isNeutral
        ? ''
        : isBuy
        ? 'text-glow-accent'
        : 'text-glow-destructive';
    
    return (
        <Card className="bg-card/50 border border-border/50 p-3">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-headline text-sm tracking-wider uppercase text-muted-foreground">{title}</h4>
                <Icon className={cn("h-4 w-4", colorClass)} />
            </div>
            { status === 'PENDING' ? <Skeleton className="h-10 w-full" /> : (
            <>
                <div className={cn("font-mono text-lg font-bold", colorClass, glowClass)}>
                    {isNeutral ? 'NEUTRAL' : isBuy ? 'BULLISH' : 'BEARISH'}
                </div>
                <div className="flex justify-between items-baseline text-xs text-muted-foreground font-mono">
                    <span>{(confidence * 100).toFixed(0)}%</span>
                    <span>{latency.toFixed(0)}ms</span>
                </div>
            </>
            )}
        </Card>
    );
};

export default function TacticalSignalsPanel() {
    const { 
        orderbookImbalance, 
        liquidationCascade,
        openInterestShock,
        fundingRatePressure,
        marketRegime,
        systemStatus
    } = useIntelligenceStore();

    const { engineLatencies } = useLatencyStore(s => s.latest);

    return (
        <div className="h-full flex flex-col gap-4">
            <SignalCard
                title="Orderbook"
                Icon={Waves}
                signal={!orderbookImbalance || orderbookImbalance.side === 'neutral' ? 'NEUTRAL' : orderbookImbalance.side === 'buy' ? 'BUY' : 'SELL'}
                confidence={orderbookImbalance ? Math.abs(orderbookImbalance.imbalance) : 0}
                latency={engineLatencies?.orderbookImbalanceEngine || 0}
                status={systemStatus.orderbookImbalanceEngine || 'IDLE'}
            />
            <SignalCard
                title="Liquidations"
                Icon={Flame}
                signal={!liquidationCascade || !liquidationCascade.detected ? 'NEUTRAL' : liquidationCascade.direction === 'short' ? 'BUY' : 'SELL'}
                confidence={liquidationCascade?.intensity || 0}
                latency={engineLatencies?.liquidationCascadeEngine || 0}
                status={systemStatus.liquidationCascadeEngine || 'IDLE'}
            />
             <SignalCard
                title="Open Interest"
                Icon={TrendingUp}
                signal={!openInterestShock || !openInterestShock.shock ? 'NEUTRAL' : 'NEUTRAL'}
                confidence={openInterestShock?.magnitude || 0}
                latency={engineLatencies?.openInterestShockEngine || 0}
                status={systemStatus.openInterestShockEngine || 'IDLE'}
            />
             <SignalCard
                title="Funding Rate"
                Icon={Gauge}
                signal={!fundingRatePressure || !fundingRatePressure.extreme ? 'NEUTRAL' : fundingRatePressure.pressure === 'short' ? 'BUY' : 'SELL'}
                confidence={fundingRatePressure ? (fundingRatePressure.fundingRate / 0.0002) : 0}
                latency={engineLatencies?.fundingRatePressureEngine || 0}
                status={systemStatus.fundingRatePressureEngine || 'IDLE'}
            />
             <SignalCard
                title="Market Regime"
                Icon={Zap}
                signal={!marketRegime || marketRegime.regime === 'RANGING' ? 'NEUTRAL' : marketRegime.regime === 'TRENDING' ? 'BUY' : 'SELL'}
                confidence={marketRegime?.confidence || 0}
                latency={engineLatencies?.marketRegimeEngine || 0}
                status={systemStatus.marketRegimeEngine || 'IDLE'}
            />
        </div>
    );
}
