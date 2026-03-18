
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse, Smile, Frown, Meh } from 'lucide-react';
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

export default function MarketSentimentPanel() {
  const { marketSentiment, isAnalyzing } = useIntelligenceStore();
  const sentiment = marketSentiment;

  const SentimentIcon = ({ sent }: { sent?: 'bullish' | 'bearish' | 'neutral' }) => {
    if (sent === 'bullish') return <Smile className="h-5 w-5 text-primary text-glow" />;
    if (sent === 'bearish') return <Frown className="h-5 w-5 text-destructive text-glow-destructive" />;
    return <Meh className="h-5 w-5 text-accent text-glow-accent" />;
  }

  return (
    <Card className="tactical-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Market Sentiment</CardTitle>
        <HeartPulse className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isAnalyzing && !sentiment ? (
          <PanelSkeleton />
        ) : !sentiment ? (
          <div className="text-center text-sm text-muted-foreground">Awaiting data...</div>
        ) : (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-widest">
                        Live Sentiment
                    </h3>
                    <div className={cn("flex items-center gap-2 font-medium text-lg font-mono", {
                        "text-primary": sentiment.sentiment === 'bullish',
                        "text-destructive": sentiment.sentiment === 'bearish',
                        "text-accent": sentiment.sentiment === 'neutral'
                    })}>
                        <SentimentIcon sent={sentiment.sentiment} />
                        {sentiment.sentiment.toUpperCase()}
                    </div>
                </div>
                <div>
                     <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-widest mb-2">
                        Confidence
                    </h3>
                    <Progress value={sentiment.confidence * 100} className="h-2" />
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
