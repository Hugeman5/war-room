'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu } from 'lucide-react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { useLatencyStore } from '@/store/latencyStore';
import { cn } from '@/lib/utils';

function DataRow({ label, value, highlight }: { label: string; value: string | number; highlight?: 'bullish' | 'bearish' | 'neutral' | 'high' | 'moderate' | 'low' | 'approve' | 'reject' | 'active' | 'failed' | 'disabled' }) {
    const highlightClass = 
      highlight === 'bullish' ? 'text-primary text-glow' 
      : highlight === 'bearish' ? 'text-destructive text-glow-destructive' 
      : highlight === 'high' ? 'text-destructive text-glow-destructive'
      : highlight === 'moderate' ? 'text-accent text-glow-accent'
      : highlight === 'low' ? 'text-primary'
      : highlight === 'approve' ? 'text-primary text-glow'
      : highlight === 'reject' ? 'text-destructive text-glow-destructive'
      : highlight === 'active' ? 'text-accent text-glow-accent'
      : highlight === 'failed' ? 'text-destructive text-glow-destructive'
      : highlight === 'disabled' ? 'text-muted-foreground'
      : 'text-foreground/90';

    return (
        <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">
                {label}
            </h3>
            <p className={cn("text-base font-medium font-mono", highlightClass)}>
                {value}
            </p>
        </div>
    )
}

export default function CommandConsolePanel() {
  const { 
      timestamp: lastSnapshotTime, 
      masterAIBrainOutput, 
      strategy, 
      analysisStatus,
      systemStatus,
      signalConfidence 
  } = useIntelligenceStore();
  
  const { engineLatencies } = useLatencyStore(s => s.latest);

  const getStatusMessage = () => {
    if (analysisStatus === 'analyzing-chart' || analysisStatus === 'generating-insights') return 'Consolidating Intelligence...';
    if (!lastSnapshotTime) return 'Awaiting Intelligence Snapshot...';
    if (!masterAIBrainOutput) return 'Awaiting Master AI Brain Analysis...';
    return 'Assessment Complete.';
  }
  
  const aiEngineStatus = systemStatus.aiInferenceEngine || 'DISABLED';
  const confidence = signalConfidence ? (signalConfidence.finalConfidence * 100).toFixed(0) : 0;
  const latency = engineLatencies?.aiInferenceEngine?.toFixed(0) || 'N/A';
  const modelName = "WarRoom_v1";

  return (
    <Card className="tactical-card h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">AI Diagnostics</CardTitle>
        <Cpu className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {!lastSnapshotTime || !masterAIBrainOutput || !signalConfidence ? (
          <div className="flex h-full min-h-[150px] items-center justify-center">
            <p className="text-center text-base text-muted-foreground animate-pulse">
              { getStatusMessage() }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
              <DataRow label="AI Engine" value={aiEngineStatus} highlight={aiEngineStatus.toLowerCase() as any} />
              <DataRow label="Model" value={modelName} />
              <DataRow label="Confidence" value={`${confidence}%`} />
              <DataRow label="Latency" value={`${latency}ms`} />
              <DataRow label="AI Bias" value={signalConfidence.dominantBias} highlight={signalConfidence.dominantBias.toLowerCase() as any}/>
              <DataRow label="Guard Result" value={strategy?.aiDecision || 'N/A'} highlight={strategy?.aiDecision?.toLowerCase() as any} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
