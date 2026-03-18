'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useIntelligenceStore, type SystemStatusValue } from '@/store/intelligenceStore';
import { useLatencyStore } from '@/store/latencyStore';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { ENGINE_REGISTRY } from '@/intelligence/engineRegistry';

const StatusIcon = ({ status }: { status: SystemStatusValue }) => {
    let pulseClass = 'bg-muted-foreground';
    if (status === 'ACTIVE') pulseClass = 'bg-accent animate-pulse';
    if (status === 'FAILED') pulseClass = 'bg-destructive animate-pulse';
    if (status === 'DEGRADED' || status === 'LEARNING' || status === 'PENDING') pulseClass = 'bg-primary animate-pulse';
    if (status === 'IDLE') pulseClass = 'bg-blue-500';

    return <div className={cn("h-2.5 w-2.5 rounded-full", pulseClass)}></div>;
};

export default function EngineStatusPanel() {
    const { systemStatus } = useIntelligenceStore();
    const { latest: latencyMetrics } = useLatencyStore();

    const getStatusText = (status: SystemStatusValue) => {
        if (!status) return 'IDLE';
        if (status === 'ACTIVE') return 'RUNNING';
        return status;
    }

    return (
        <Card className="tactical-card h-full flex flex-col border-0 shadow-none bg-transparent">
            <CardContent className="overflow-hidden p-0 flex-1">
                <ScrollArea className="h-full max-h-[220px]">
                    <div className="space-y-2">
                        {Object.entries(ENGINE_REGISTRY).map(([key, name]) => {
                             const status = systemStatus[key as keyof typeof systemStatus] || 'IDLE';
                             const duration = latencyMetrics.engineLatencies?.[key];
                             
                             const statusText = getStatusText(status);

                             return (
                             <div key={key} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{name}</span>
                                <div className={cn("flex items-center gap-2 font-mono", {
                                    'text-destructive': status === 'FAILED',
                                    'text-primary': status === 'DEGRADED' || status === 'LEARNING' || status === 'PENDING',
                                    'text-accent': status === 'ACTIVE',
                                    'text-blue-400': status === 'IDLE',
                                    'text-muted-foreground': status === 'DISABLED'
                                })}>
                                   {duration !== undefined && <span className="w-12 text-right text-muted-foreground">{duration.toFixed(0)}ms</span>}
                                   <span className="w-20 text-left">{statusText}</span>
                                   <StatusIcon status={status} />
                                </div>
                            </div>
                        )})}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
