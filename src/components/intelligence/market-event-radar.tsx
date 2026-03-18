'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar } from 'lucide-react';
import { useMarketEventStore, type MarketEvent } from '@/store/marketEventStore';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

export default function MarketEventRadar() {
  const events = useMarketEventStore(state => state.events);

  const impactColor: Record<MarketEvent['impact'], string> = {
    MEDIUM: 'text-accent',
    HIGH: 'text-destructive',
    CRITICAL: 'text-destructive text-glow-destructive animate-pulse',
  };

  return (
    <Card className="tactical-card h-[250px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Market Event Radar</CardTitle>
        <Radar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="overflow-hidden p-0 flex-1">
         {events.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-muted-foreground">
              Scanning for market events...
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full p-4">
            <div className="space-y-3">
              {events.slice(0, 10).map(event => (
                  <div key={event.id} className="flex items-start gap-3 text-sm">
                      <div className="flex-1">
                          <p className={cn("font-mono font-medium", impactColor[event.impact])}>
                            {event.type.toUpperCase()} EVENT
                          </p>
                          <p className="text-xs text-muted-foreground">{event.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground/50 font-mono">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                  </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
