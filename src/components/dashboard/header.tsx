'use client';

import { useIntelligenceStore } from '@/store/intelligenceStore';
import { useMarketDataStore } from '@/store/marketDataStore';
import { useReplayStore } from '@/store/replayStore';
import {
  Shield,
  Maximize,
  Minimize,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/priceFormatter';
import { Button } from '../ui/button';

const BUILD_VERSION = "WARROOM v0.5.0";

const Separator = () => <div className="h-6 w-px bg-border" />;

type StatusIndicatorProps = {
  label: string;
  value: string;
  alertLevel?: 'operational' | 'warning' | 'critical' | 'idle';
};

const StatusIndicator = ({
  label,
  value,
  alertLevel = 'operational',
}: StatusIndicatorProps) => {
  const alertClasses = {
    operational: 'text-accent',
    warning: 'text-primary',
    critical: 'text-destructive',
    idle: 'text-muted-foreground',
  };

  return (
    <div className="flex flex-col items-center">
      <div className="font-headline text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          'font-mono text-sm font-medium',
          alertClasses[alertLevel],
          alertLevel === 'operational' && 'animate-pulse text-glow-accent',
          alertLevel === 'warning' && 'animate-pulse text-glow',
          alertLevel === 'critical' && 'animate-pulse text-glow-destructive',
        )}
      >
        {value}
      </div>
    </div>
  );
};


const TimeDisplay = () => {
  const [time, setTime] = useState({
    utc: '--:--:--',
    capeTown: '--:--:--',
    houston: '--:--:--',
  });

  useEffect(() => {
    const formatTime = (date: Date, timeZone: string) => {
      try {
        return new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone,
        }).format(date);
      } catch (e) {
        console.error(`Invalid time zone: ${timeZone}`, e);
        return '??:??:??';
      }
    };

    const timer = setInterval(() => {
      const now = new Date();
      setTime({
        utc: formatTime(now, 'UTC'),
        capeTown: formatTime(now, 'Africa/Johannesburg'),
        houston: formatTime(now, 'America/Chicago'),
      });
    }, 1000);

    // Initial call to set time immediately
    const now = new Date();
    setTime({
        utc: formatTime(now, 'UTC'),
        capeTown: formatTime(now, 'Africa/Johannesburg'),
        houston: formatTime(now, 'America/Chicago'),
    });

    return () => clearInterval(timer);
  }, []);
  

  return (
     <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
        <span>UTC: {time.utc}</span>
        <Separator />
        <span>Eugene – Cape Town: {time.capeTown}</span>
        <Separator />
        <span>Deon – Houston: {time.houston}</span>
     </div>
  )
}

export default function Header({ isChartFullscreen, toggleChartFullscreen }: { isChartFullscreen?: boolean, toggleChartFullscreen?: () => void }) {
  const { riskEnvironment, marketRegime, overallStatus, isPipelineActive, togglePipeline, strategy } = useIntelligenceStore();
  const { btcPrice, isFeedConnected } = useMarketDataStore();
  const isReplayActive = useReplayStore(state => state.isActive);

  const getSystemHealth = (): { label: string; level: StatusIndicatorProps['alertLevel'] } => {
    if (!isPipelineActive) return { label: 'OFFLINE', level: 'critical' };
    
    switch(overallStatus) {
      case 'live': return { label: 'OPERATIONAL', level: 'operational' };
      case 'degraded': return { label: 'DEGRADED', level: 'warning' };
      case 'critical': return { label: 'CRITICAL', level: 'critical' };
      case 'initializing': return { label: 'INITIALIZING', level: 'warning' };
      case 'idle':
      default:
        return { label: 'OFFLINE', level: 'idle' };
    }
  }

  const getStrategyModeDetails = (): { label: string; level: StatusIndicatorProps['alertLevel'] } => {
    const riskMode = riskEnvironment?.tradeMode;
    const regime = marketRegime?.regime;
    
    // Highest priority: HALTED
    if (riskMode === 'HALTED') {
      return { label: 'HALTED', level: 'critical' }; // Red
    }
    
    // DEFENSIVE if riskMode says so, or if we are in a ranging market.
    if (riskMode === 'DEFENSIVE' || regime === 'RANGING') {
      return { label: 'DEFENSIVE', level: 'warning' }; // Orange/Gold
    }
    
    // AGGRESSIVE if we are in a trending market and not defensive.
    if (regime === 'TRENDING') {
        return { label: 'AGGRESSIVE', level: 'operational' }; // Green
    }

    // If no other conditions met, but risk is NORMAL, display NORMAL
    if (riskMode === 'NORMAL') {
        // 'operational' is green, which is the closest to a "go" signal.
        return { label: 'NORMAL', level: 'operational' }; // Green
    }
    
    // Fallback
    return { label: 'STANDBY', level: 'warning' };
  };

  const getVolatilityDetails = (): { value: string; level: StatusIndicatorProps['alertLevel'] } => {
      const volScore = marketRegime?.volatilityScore;
      if (volScore === undefined) return { value: "N/A", level: 'idle' };
      
      let level: StatusIndicatorProps['alertLevel'] = 'operational';
      if (volScore > 70) level = 'critical';
      else if (volScore > 40) level = 'warning';

      return { value: `${volScore.toFixed(0)}%`, level };
  };
  
  const getConfidenceDetails = (): { value: string; level: StatusIndicatorProps['alertLevel'] } => {
      const confidence = strategy?.confidence;
       if (confidence === undefined) return { value: "N/A", level: 'idle' };
      
      let level: StatusIndicatorProps['alertLevel'] = 'critical';
      if (confidence > 75) level = 'operational';
      else if (confidence > 50) level = 'warning';

      return { value: `${confidence.toFixed(0)}%`, level };
  }

  const systemHealth = getSystemHealth();
  const strategyModeDetails = getStrategyModeDetails();
  const volatilityDetails = getVolatilityDetails();
  const confidenceDetails = getConfidenceDetails();

  return (
    <header className="flex flex-col items-center justify-between gap-2 rounded-lg border border-border bg-card p-2 text-card-foreground shadow-[0_0_10px_hsl(var(--primary)/0.15),inset_0_0_8px_hsl(var(--primary)/0.1)]">
      {/* Top Row: Title */}
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary text-glow" />
          <div>
            <h1 className="font-headline font-bold text-lg tracking-wider text-glow">
              STELLENBOSCH MAFIA WAR ROOM
            </h1>
            <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground -mt-1">
                Strategic Trading Command Center
                </p>
                 <span className="text-xs font-mono text-primary/50 -mt-1">{BUILD_VERSION}</span>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4">
          {toggleChartFullscreen && (
            <Button variant="outline" size="sm" onClick={toggleChartFullscreen} className="h-7 px-3 text-xs font-mono">
              {isChartFullscreen ? <Minimize /> : <Maximize />}
              {isChartFullscreen ? 'Collapse View' : 'Expand Chart'}
            </Button>
          )}
          <TimeDisplay />
        </div>
      </div>
      
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-1"></div>

      {/* Bottom Row: Status */}
      <div className="flex w-full items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="font-headline text-xs uppercase tracking-widest text-muted-foreground">AI Core</div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={togglePipeline} 
                    className={cn(
                        "h-auto px-2 py-0 font-mono text-sm font-medium",
                        systemHealth.level === 'operational' && "text-accent text-glow-accent",
                        systemHealth.level === 'warning' && "text-primary text-glow",
                        systemHealth.level === 'critical' && "text-destructive text-glow-destructive",
                        systemHealth.level === 'idle' && "text-muted-foreground",
                        isPipelineActive && systemHealth.level !== 'critical' && 'animate-pulse'
                    )}
                >
                    {systemHealth.label}
                </Button>
              </div>
              <Separator />
              {isReplayActive ? (
                 <StatusIndicator label="Mode" value={"REPLAY"} alertLevel="warning" />
              ) : (
                <StatusIndicator label="Market Feed" value={isFeedConnected ? "ONLINE" : "OFFLINE"} alertLevel={isFeedConnected ? "operational" : "critical"} />
              )}
              <Separator />
              <StatusIndicator label="BTC Price" value={formatPrice(btcPrice)} />
              <Separator />
               {marketRegime && isPipelineActive && (
                <>
                  <StatusIndicator label="Market Regime" value={marketRegime?.regime ?? "N/A"} />
                  <Separator />
                  <StatusIndicator label="Volatility" value={volatilityDetails.value} alertLevel={volatilityDetails.level} />
                  <Separator />
                  <StatusIndicator label="Strategy Mode" value={strategyModeDetails.label} alertLevel={strategyModeDetails.level} />
                  <Separator />
                  <StatusIndicator label="AI Confidence" value={confidenceDetails.value} alertLevel={confidenceDetails.level} />
                </>
              )}
          </div>
           <div className="flex lg:hidden items-center gap-4">
            {toggleChartFullscreen && (
              <Button variant="outline" size="sm" onClick={toggleChartFullscreen} className="h-7 px-3 text-xs font-mono">
                  {isChartFullscreen ? <Minimize /> : <Maximize />}
              </Button>
            )}
            <TimeDisplay />
          </div>
      </div>
    </header>
  );
}
