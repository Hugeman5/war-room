'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DiagnosticsPanel from '@/components/dashboard/diagnostics-panel';
import IntelligenceSnapshot from '@/components/debug/IntelligenceSnapshot';

export default function DebugPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start bg-background p-4 md:p-8 font-body">
        <div className="w-full max-w-6xl space-y-4">
             <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary text-glow">War Room Diagnostics Console</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This page provides a real-time overview of the system's health, engine status, and a live view of the intelligence snapshot.
                  </p>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DiagnosticsPanel />
                <IntelligenceSnapshot />
            </div>
        </div>
    </div>
  );
}
