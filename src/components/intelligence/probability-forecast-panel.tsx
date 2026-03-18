
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Telescope, TrendingUp, TrendingDown } from 'lucide-react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

function PanelSkeleton() {
    return (
        <div className="space-y-3 pt-2 h-[72px] justify-center flex flex-col">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
        </div>
    )
}

const ProbabilityBar = ({ label, value, colorClass, icon: Icon }: { label: string; value: number; colorClass: string; icon: React.ElementType }) => (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <Icon className={cn("h-4 w-4", colorClass.includes('primary') ? 'text-primary' : 'text-destructive')} />
            <span>{label}</span>
        </div>
        <div className="h-2 bg-muted/20 rounded-full w-full">
            <div 
                className={cn("h-2 rounded-full transition-all duration-500", colorClass)}
                style={{ width: `${value}%` }}
            />
        </div>
        <div className="w-12 text-right font-mono font-bold text-sm text-foreground/90">{value}%</div>
    </div>
);


export default function ProbabilityForecastPanel() {
  const { probabilityForecast, isAnalyzing } = useIntelligenceStore();
  const forecast = probabilityForecast;

  // Use the specific long/short probabilities if available, otherwise derive from tradeProbability
  const bullProb = forecast?.probabilityLong ?? forecast?.tradeProbability ?? 0.5;
  const bearProb = forecast?.probabilityShort ?? (1 - (forecast?.tradeProbability ?? 0.5));
  
  const bullValue = Math.round(bullProb * 100);
  const bearValue = Math.round(bearProb * 100);
  
  return (
    <Card className="tactical-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Probability Forecast</CardTitle>
        <Telescope className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isAnalyzing && !forecast ? (
          <PanelSkeleton />
        ) : !forecast ? (
          <div className="text-center text-sm text-muted-foreground h-[72px] flex items-center justify-center">Awaiting data...</div>
        ) : (
           <div className="w-full space-y-3 pt-2">
              <ProbabilityBar label="Bull" value={bullValue} colorClass="bg-primary shadow-[0_0_8px_hsl(var(--primary))]" icon={TrendingUp} />
              <ProbabilityBar label="Bear" value={bearValue} colorClass="bg-destructive shadow-[0_0_8px_hsl(var(--destructive))]" icon={TrendingDown} />
           </div>
        )}
      </CardContent>
    </Card>
  );
}
