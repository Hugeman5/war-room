
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Loader2 } from 'lucide-react';
import { useMarketDataStore } from '@/store/marketDataStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

export default function NewsPanel() {
  const news = useMarketDataStore(state => state.marketNews);

  return (
    <Card className="tactical-card flex flex-col h-full">
      <CardHeader 
        className="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <CardTitle className="tactical-title">Market News Feed</CardTitle>
        <Newspaper className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="overflow-hidden relative p-0 flex-1">
        {news.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
           <Loader2 className="w-10 h-10 text-muted-foreground/50 mb-4 animate-spin" />
          <h3 className="font-semibold text-foreground/90">Fetching News...</h3>
          <p className="text-base text-muted-foreground">
            Connecting to news aggregation service.
          </p>
        </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {news.slice(0, 10).map((item) => (
                <a 
                  key={item.link} 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block group"
                >
                  <div className="text-base font-medium text-foreground/90 group-hover:text-primary transition-colors leading-tight">
                    {item.title}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                    <span>{item.source}</span>
                    <span>
                      {formatDistanceToNow(new Date(item.isoDate), { addSuffix: true })}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
