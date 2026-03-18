'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EngineStatusPanel from './engine-status';
import SystemLatencyPanel from '../intelligence/SystemLatencyPanel';
import AdaptiveIntelPanel from '../intelligence/adaptive-intel-panel';
import { SlidersHorizontal } from 'lucide-react';

export default function DiagnosticsPanel() {
  return (
    <Card className="tactical-card h-full">
       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="tactical-title">Diagnostics</CardTitle>
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="health" className="text-xs">Health</TabsTrigger>
            <TabsTrigger value="latency" className="text-xs">Latency</TabsTrigger>
            <TabsTrigger value="adaptive" className="text-xs">Adaptive</TabsTrigger>
          </TabsList>
          <TabsContent value="health" className="mt-4">
            <EngineStatusPanel />
          </TabsContent>
          <TabsContent value="latency" className="mt-4">
            <SystemLatencyPanel />
          </TabsContent>
          <TabsContent value="adaptive" className="mt-4">
            <AdaptiveIntelPanel />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
