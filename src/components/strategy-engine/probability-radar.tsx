'use client';

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

type ProbabilityRadarProps = {
  isReady: boolean;
  bullProbability: number;
  bearProbability: number;
  volatility: number;
  consolidation: number;
  breakout: number;
};

export default function ProbabilityRadar({ 
  isReady, 
  bullProbability = 0, 
  bearProbability = 0,
  volatility = 0,
  consolidation = 0,
  breakout = 0
}: ProbabilityRadarProps) {
  
  const radarData = isReady ? [
    { subject: 'Bull', A: bullProbability, fullMark: 100 },
    { subject: 'Bear', A: bearProbability, fullMark: 100 },
    { subject: 'Consolidation', A: consolidation, fullMark: 100 },
    { subject: 'Breakout', A: breakout, fullMark: 100 },
    { subject: 'VOLATILITY', A: volatility, fullMark: 100 },
  ] : Array(5).fill({ A: 0, fullMark: 100 }).map((item, i) => ({ ...item, subject: ['Bull', 'Bear', 'Cons.', 'Brkout', 'Vol.'][i] }));

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-widest">Probability Radar</h3>
      <div className="mt-2 text-sm">
        <div className="relative h-48 w-full">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-[85%] w-[85%] rounded-full border-2 border-dashed border-primary/10" />
            </div>
            {isReady && (
              <div className="absolute inset-0 animate-radar-sweep [background:conic-gradient(from_180deg_at_50%_50%,#05070500_0deg,hsl(var(--primary)/0.2)_20deg,#05070500_60deg)]" />
            )}
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="70%"
              data={radarData}
              margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
            >
              <PolarGrid 
                stroke="hsl(var(--primary) / 0.2)" 
                strokeDasharray="3 3"
              />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'var(--font-mono)' }} 
              />
              <Radar
                name="Probability"
                dataKey="A"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={0.4}
                className="drop-shadow-[0_0_5px_hsl(var(--primary))]"
                dot={{
                    stroke: 'hsl(var(--primary))',
                    strokeWidth: 2,
                    fill: 'hsl(var(--background))',
                    r: 3,
                    className: 'animate-pulse-glow'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
