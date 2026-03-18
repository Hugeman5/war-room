'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

type SessionIntelPanelProps = {
  sessionIntel: {
    asia: string;
    london: string;
    ny: string;
  };
};

const getSessionStatus = (intel: string) => {
  if (intel.includes('active')) return { label: 'ACTIVE', className: 'text-primary animate-pulse' };
  if (intel.includes('closed')) return { label: 'CLOSED', className: 'text-muted-foreground/50' };
  return { label: 'STANDBY', className: 'text-accent' };
};

const getSessionCommentary = (intel: string) => {
    if (intel.toLowerCase().includes('low volatility')) return 'LOW VOL';
    if (intel.toLowerCase().includes('liquidity increases')) return 'BUILDING FLOW';
    if (intel.toLowerCase().includes('peak volatility')) return 'HIGH IMPACT';
    return 'STANDBY';
}

export default function SessionIntelPanel({ sessionIntel }: SessionIntelPanelProps) {
  const sessions = [
    { name: 'ASIA', intel: sessionIntel.asia },
    { name: 'LONDON', intel: sessionIntel.london },
    { name: 'NY', intel: sessionIntel.ny },
  ];

  return (
    <Card className="tactical-card h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Session Intelligence</CardTitle>
        <Globe className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4 font-body text-sm">
          {sessions.map((session) => {
            const status = getSessionStatus(session.intel);
            const commentary = getSessionCommentary(session.intel);
            const isActive = status.label === 'ACTIVE';

            return (
              <div key={session.name} className="flex items-center justify-between">
                <span className="text-foreground/80 tracking-wider">{session.name} SESSION</span>
                <div className={cn('flex items-center gap-2 font-medium tracking-widest font-mono', status.className)}>
                   <div className={cn("w-2.5 h-2.5 border", isActive ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]' : 'border-current' )}></div>
                  <span className={cn(isActive && 'text-glow')}>{commentary}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
