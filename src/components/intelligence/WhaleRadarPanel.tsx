
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Anchor } from 'lucide-react';
import { useMarketEventStore } from '@/store/marketEventStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { formatPrice } from '@/lib/priceFormatter';

export default function WhaleRadarPanel() {
  const allEvents = useMarketEventStore(state => state.events);
  const whaleEvents = allEvents.filter(e => e.type === 'WHALE').sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Card className="tactical-card flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Whale Radar</CardTitle>
        <Anchor className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="overflow-hidden relative p-0 flex-1">
        {whaleEvents.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <p className="text-base text-muted-foreground">Monitoring large BTC movements...</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {whaleEvents.slice(0, 20).map((event) => {
                if (event.type !== 'WHALE') return null;
                const isOutflow = event.details.direction === 'exchange_outflow';
                const colorClass = isOutflow ? 'text-accent' : 'text-destructive';

                return (
                  <div key={event.id} className="text-base">
                    <div className={cn("font-mono font-medium flex justify-between items-baseline", colorClass)}>
                      <span>{event.details.direction.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className={cn(isOutflow ? 'text-glow-accent' : 'text-glow-destructive')}>
                        {event.details.btcAmount.toLocaleString()} BTC
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                      <span>{formatPrice(event.details.usdValue)}</span>
                      <span>
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
