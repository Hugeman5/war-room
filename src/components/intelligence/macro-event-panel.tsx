
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Gauge, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

function PanelSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
        </div>
    )
}

const RiskGauge = ({ direction }: { direction: 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL' }) => {
  const colorClass = 
    direction === 'RISK_ON' ? 'text-accent' 
    : direction === 'RISK_OFF' ? 'text-destructive' 
    : 'text-primary';

  const glowClass = 
    direction === 'RISK_ON' ? 'text-glow-accent'
    : direction === 'RISK_OFF' ? 'text-glow-destructive'
    : 'text-glow';

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-widest mb-2">
        Macro Environment
      </h3>
      <div className={cn("font-headline text-xl font-bold tracking-widest flex items-center gap-2", colorClass, glowClass)}>
        <Gauge className="h-5 w-5" />
        {direction.replace('_', '-')}
      </div>
    </div>
  )
};

export default function MacroEventPanel() {
  const macroEvents = useIntelligenceStore(state => state.macroEvents);
  const isHighRisk = macroEvents?.macroRisk === 'HIGH';

  return (
    <Card className={cn("tactical-card h-full", isHighRisk && "border-destructive/50 bg-destructive/10")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("tactical-title", isHighRisk && "text-destructive text-glow-destructive")}>Macro Intel</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!macroEvents ? <PanelSkeleton /> : (
            <div className="space-y-4">
                <RiskGauge direction={macroEvents.riskDirection} />
                <Separator className="bg-border" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next Event</span>
                      <span className="font-medium text-foreground/90 text-right">{macroEvents.event}</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Impact</span>
                      <span className={cn("font-medium", {
                        'text-primary': macroEvents.impactLevel === 'MODERATE',
                        'text-destructive text-glow-destructive': macroEvents.impactLevel === 'HIGH' || macroEvents.impactLevel === 'CRITICAL',
                      })}>{macroEvents.impactLevel}</span>
                  </div>
                   <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">BTC Bias</span>
                       <div className={cn("flex items-center gap-2 font-medium", {
                           'text-accent': macroEvents.direction === 'BULLISH_BTC',
                           'text-destructive': macroEvents.direction === 'BEARISH_BTC',
                       })}>
                          {macroEvents.direction === 'BULLISH_BTC' && <TrendingUp className="h-4 w-4" />}
                          {macroEvents.direction === 'BEARISH_BTC' && <TrendingDown className="h-4 w-4" />}
                          {macroEvents.direction.replace('_BTC', '')}
                      </div>
                  </div>
                   <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Volatility Risk</span>
                       <div className={cn("flex items-center gap-2 font-medium", {
                           'text-primary': macroEvents.volatilityExpectation === 'NORMAL',
                           'text-accent text-glow-accent': macroEvents.volatilityExpectation === 'ELEVATED',
                       })}>
                          {macroEvents.volatilityExpectation === 'ELEVATED' && <AlertTriangle className="h-4 w-4" />}
                          {macroEvents.volatilityExpectation}
                      </div>
                  </div>
              </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
