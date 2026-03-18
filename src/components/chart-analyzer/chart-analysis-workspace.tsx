
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import LiveBTCChart from './live-btc-chart';
import type { Timeframe } from '@/lib/candle-builder';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { Badge } from '@/components/ui/badge';

const availableTimeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

const RegimeIndicator = () => {
    const regime = useIntelligenceStore(state => state.marketRegime);
    if (!regime) return null;

    const regimeMapping: Record<string, {label: string, className: string}> = {
        'TRENDING': { label: 'TREND', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
        'RANGING': { label: 'RANGE', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        'BREAKOUT': { label: 'VOLATILITY', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
        'ACCUMULATION': { label: 'COMPRESSION', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
        'DISTRIBUTION': { label: 'COMPRESSION', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    };

    const displayInfo = regimeMapping[regime.regime];
    if (!displayInfo) return null;
    
    let volLabel = '';
    if (regime.volatilityState === 'EXPANDING') volLabel = ' | VOL ↑';
    if (regime.volatilityState === 'COMPRESSING') volLabel = ' | VOL ↓';


    return (
        <Badge variant="outline" className={cn("text-xs font-mono", displayInfo.className)}>
            REGIME: {displayInfo.label}{volLabel}
        </Badge>
    )
}

const WarRoomSignalIndicator = () => {
    const { signalConfidence } = useIntelligenceStore();
    if (!signalConfidence) return null;

    const { dominantBias, finalConfidence } = signalConfidence;
    if (dominantBias === 'Neutral') return null;

    const colorClass = 
        dominantBias === 'Bullish' ? 'text-accent text-glow-accent'
      : dominantBias === 'Bearish' ? 'text-destructive text-glow-destructive'
      : 'text-muted-foreground';
    
    return (
      <div className="flex flex-col items-center border border-primary/20 rounded-md px-3 py-1">
        <div className="font-headline text-sm uppercase tracking-widest text-primary text-glow">
          War Room Signal
        </div>
        <div className={cn('font-mono text-base font-medium', colorClass)}>
          {dominantBias.toUpperCase()} ({ (finalConfidence * 100).toFixed(0) }%)
        </div>
      </div>
    );
};

export default function ChartAnalysisWorkspace() {
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('15m');

  return (
    <Card className="tactical-card flex h-[60vh] flex-col lg:h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle className="tactical-title">
            Live BTC Market Chart
          </CardTitle>
          <RegimeIndicator />
        </div>
        <div className="hidden lg:flex"><WarRoomSignalIndicator /></div>
        <div className="flex items-center gap-1 rounded-md bg-card p-1 border border-border">
          {availableTimeframes.map((tf) => (
            <Button
              key={tf}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTimeframe(tf)}
              className={cn(
                "h-7 px-3 text-xs font-mono transition-colors",
                activeTimeframe === tf
                  ? 'bg-primary/20 text-primary hover:bg-primary/30 hover:text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent 
        className="p-0 flex-1"
      >
        <LiveBTCChart activeTimeframe={activeTimeframe} />
      </CardContent>
    </Card>
  );
}
