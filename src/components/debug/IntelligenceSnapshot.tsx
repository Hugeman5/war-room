'use client';

import { useIntelligenceStore } from '@/store/intelligenceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function IntelligenceSnapshot() {
    const intelligenceState = useIntelligenceStore();
    
    // We don't want to render functions, so we'll pick the state we want to see
    const snapshot = {
        isAnalyzing: intelligenceState.isAnalyzing,
        analysisStatus: intelligenceState.analysisStatus,
        systemStatus: intelligenceState.systemStatus,
        overallStatus: intelligenceState.overallStatus,
        timestamp: intelligenceState.timestamp,
        masterAIBrainOutput: intelligenceState.masterAIBrainOutput,
        strategy: intelligenceState.strategy,
        // Add individual engine outputs for detailed debugging
        marketStructure: intelligenceState.marketStructure,
        liquidityMap: intelligenceState.liquidityMap,
        liquidationHeatmap: intelligenceState.liquidationHeatmap,
        marketRegime: intelligenceState.marketRegime,
        orderBlocks: intelligenceState.orderBlocks,
        smartMoney: intelligenceState.smartMoney,
        historicalAnalysis: intelligenceState.historicalAnalysis,
    }

    return (
        <Card className="tactical-card h-full max-h-[80vh] flex flex-col">
             <CardHeader>
                <CardTitle className="tactical-title">Live Intelligence Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <pre className="text-xs">
                        {JSON.stringify(snapshot, null, 2)}
                    </pre>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
