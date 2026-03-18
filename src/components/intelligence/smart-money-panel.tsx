
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, Users } from 'lucide-react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

function PanelSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
        </div>
    )
}

export default function SmartMoneyPanel() {
  const { smartMoney, isAnalyzing } = useIntelligenceStore();

  return (
    <Card className="tactical-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Smart Money Footprint</CardTitle>
        <Banknote className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isAnalyzing && !smartMoney ? (
          <PanelSkeleton />
        ) : !smartMoney ? (
          <div className="text-center text-sm text-muted-foreground">Awaiting data...</div>
        ) : (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-widest">
                        Detected Activity
                    </h3>
                    <div className={cn("font-medium text-lg font-mono", {
                        "text-primary text-glow": smartMoney.activity === 'accumulation' || smartMoney.activity === 'absorption',
                        "text-destructive text-glow-destructive": smartMoney.activity === 'distribution',
                        "text-accent": smartMoney.activity === 'none'
                    })}>
                        {smartMoney.activity.toUpperCase()}
                    </div>
                </div>
                <div>
                     <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-widest mb-2">
                        Strength
                    </h3>
                    <Progress value={smartMoney.strength * 100} className="h-2" />
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
