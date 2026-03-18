
'use client';

import { useIntelligenceStore } from '@/store/intelligenceStore';
import { cn } from '@/lib/utils';
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { formatPrice } from '@/lib/priceFormatter';

const volMap: Record<string, number> = {
  Low: 25, Medium: 50, High: 75, Extreme: 100,
  '': 0, 'Unknown': 0, 'Expansion': 80, 'Compression': 20, 'Normal': 50
};

export default function MarketThreatRadar() {
  const { marketRegime, liquidityMap } = useIntelligenceStore();

  if (!marketRegime || !liquidityMap) {
    return null; // Hide if data is unavailable
  }

  // --- Threat Calculation ---
  let threatScore = 0;
  let primaryRisk = 'Market Stable';

  const liquidityRisk = (liquidityMap.sweepProbability || 0) * 50;
  const volatilityRisk = ((marketRegime?.volatilityScore ?? 50) / 100) * 40;
  const regimeRisk = (marketRegime?.regime === 'BREAKOUT' ? 1 : 0) * 25;

  const risks: { [key: string]: number } = {
    'High Volatility': volatilityRisk,
    'Liquidity Sweep': liquidityRisk,
    'Market Breakout': regimeRisk,
  };

  threatScore = Math.min(100, liquidityRisk + volatilityRisk + regimeRisk);
  
  if (threatScore > 10) {
      primaryRisk = Object.keys(risks).reduce((a, b) => (risks[a] > risks[b] ? a : b));
  }
  
  // --- Determine Threat Level & Colors ---
  let level: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
  let levelColorClass = 'text-primary';
  let bgColorClass = 'bg-primary/10';
  let Icon = ShieldCheck;

  if (threatScore > 40 && threatScore <= 70) {
    level = 'AMBER';
    levelColorClass = 'text-accent text-glow-accent';
    bgColorClass = 'bg-accent/10';
    Icon = ShieldQuestion;
  } else if (threatScore > 70) {
    level = 'RED';
    levelColorClass = 'text-destructive text-glow-destructive';
    bgColorClass = 'bg-destructive/10';
    Icon = ShieldAlert;
  }

  const likelyTarget = liquidityMap.nearestPool === 'above' ? liquidityMap.liquidityAbove : liquidityMap.liquidityBelow;

  return (
    <div>
      <h3 className="tactical-title mb-3">Market Threat Radar</h3>
      <div className={cn("relative flex h-48 w-full flex-col items-center justify-center rounded-lg p-4", bgColorClass)}>
        {/* Radar Sweep Animation */}
        <div className="absolute inset-0 animate-radar-sweep [background:conic-gradient(from_180deg_at_50%_50%,#05070500_0deg,hsl(var(--primary)/0.1)_20deg,#05070500_60deg)]" />
        {/* Radar Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[90%] w-[90%] rounded-full border border-dashed border-primary/10" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[60%] w-[60%] rounded-full border border-dashed border-primary/20" />
        </div>
         <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[30%] w-[30%] rounded-full border border-solid border-primary/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
            <Icon className={cn("h-8 w-8 mb-2", levelColorClass)} />
            <h4 className={cn("font-headline text-2xl font-bold tracking-widest", levelColorClass)}>
                {level}
            </h4>
            <p className="font-mono text-sm text-muted-foreground">
                Threat Score: {Math.round(threatScore)}%
            </p>
        </div>
      </div>
      <div className="mt-4 space-y-2 font-mono text-sm">
        <div className="flex justify-between">
            <span className="text-muted-foreground">Primary Risk:</span>
            <span className="font-medium text-foreground/90">{primaryRisk}</span>
        </div>
         <div className="flex justify-between">
            <span className="text-muted-foreground">Liquidity Target:</span>
            <span className="font-medium text-foreground/90">{formatPrice(likelyTarget)}</span>
        </div>
      </div>
    </div>
  );
}
