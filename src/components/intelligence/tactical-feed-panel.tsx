'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMarketDataStore } from '@/store/marketDataStore';
import { useMarketEventStore, type MarketEvent } from '@/store/marketEventStore';
import { formatPrice } from '@/lib/priceFormatter';
import { cn } from '@/lib/utils';
import { Activity, Bell, Network, AlertTriangle, Zap } from 'lucide-react';

type FeedItem = {
  id: string;
  timestamp: number;
  Icon: React.ElementType;
  content: string;
  highlightClass: string;
};

const EventIcon = ({ type, impact }: { type: MarketEvent['type'], impact: MarketEvent['impact'] }) => {
    const color = impact === 'HIGH' || impact === 'CRITICAL' ? 'text-destructive' : impact === 'MEDIUM' ? 'text-accent' : 'text-primary/70';

    if (type === 'VOLATILITY') return <Zap className={cn("h-4 w-4", color)} />;
    if (type === 'LIQUIDITY') return <Network className={cn("h-4 w-4", color)} />;
    if (type === 'WHALE') return <Activity className={cn("h-4 w-4", color)} />;
    if (type === 'LIQUIDITY_SWEEP') return <AlertTriangle className={cn("h-4 w-4", color)} />;
    if (type === 'SMART_MONEY') return <Activity className={cn("h-4 w-4", color)} />;
    return <Bell className={cn("h-4 w-4", "text-muted-foreground")} />;
};

export default function TacticalFeedPanel() {
  const recentTrades = useMarketDataStore((state) => state.recentTrades);
  const detectedEvents = useMarketEventStore((state) => state.events);

  const combinedEvents = useMemo(() => {
    const tradeEvents: FeedItem[] = recentTrades.slice(0, 20).map(trade => ({
      id: `trade-${trade.id}`,
      timestamp: new Date(new Date().toDateString() + ' ' + trade.time).getTime(),
      Icon: () => <Activity className="h-4 w-4 text-primary/70" />,
      content: `Trade at ${formatPrice(trade.price)} (Qty: ${trade.quantity.toFixed(4)})`,
      highlightClass: 'text-muted-foreground'
    }));

    const radarEvents: FeedItem[] = detectedEvents.map(event => ({
      id: event.id,
      timestamp: event.timestamp,
      Icon: () => <EventIcon type={event.type} impact={event.impact} />,
      content: event.content,
      highlightClass: event.impact === 'HIGH' || event.impact === 'CRITICAL' ? 'text-destructive/90' : event.impact === 'MEDIUM' ? 'text-accent/90' : 'text-primary/90',
    }));

    return [...tradeEvents, ...radarEvents]
        .sort((a, b) => b.timestamp - a.timestamp)
        .filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i) // De-duplicate
        .slice(0, 50);

  }, [recentTrades, detectedEvents]);


  return (
    <Card className="tactical-card h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Tactical Feed</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden flex-1">
        <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
            {combinedEvents.map(event => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                    <event.Icon />
                    <div className="flex-1">
                         <p className={cn("font-mono", event.highlightClass)}>
                            {event.content}
                         </p>
                    </div>
                     <span className="text-xs text-muted-foreground/50 font-mono">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                </div>
            ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
