'use client';

import { useEffect, useRef } from 'react';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { useMarketEventStore } from '@/store/marketEventStore';
import type { FullSnapshot } from '@/intelligence/schemas';
import { useLatencyStore } from '@/store/latencyStore';

// The interval at which the intelligence pipeline will be triggered.
const ANALYSIS_INTERVAL = 60000; // 60 seconds

// Using a global variable to store state across strict mode re-mounts.
declare global {
  var __INTEL_INITIALIZED__: boolean;
  var __INTEL_POLLING_ID__: NodeJS.Timeout | null;
}


export default function IntelligenceFetcher() {
    const { isPipelineActive, setFullSnapshot, setOverallStatus, setAnalyzing } = useIntelligenceStore();
    const { events } = useMarketEventStore();
    const setLatency = useLatencyStore((s) => s.setLatency);
    const isFetching = useRef<boolean>(false);
    const lastEventTimestamp = useRef<number>(0);

    const fetchIntelligence = async () => {
        // Re-check pipeline status inside the async call to handle toggling
        if (isFetching.current || !useIntelligenceStore.getState().isPipelineActive) {
            return;
        }
        
        isFetching.current = true;
        const startTime = performance.now();
        console.log("POLLING INTELLIGENCE API");
        setAnalyzing(true);
        try {
            const response = await fetch('/api/intelligence');
            const duration = performance.now() - startTime;

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Intelligence API failed with status: ${response.status}`);
            }
            const snapshot: FullSnapshot = await response.json();
            
            setFullSnapshot(snapshot);
            
            const isHealthy = snapshot.masterAIBrainOutput && snapshot.strategy;
            setOverallStatus(isHealthy ? 'live' : 'degraded');

            if (snapshot.engineLatencies) {
                 setLatency({ 
                    intelligenceLatency: duration, // Total API roundtrip time
                    engineLatencies: snapshot.engineLatencies 
                });
            } else {
                setLatency({ intelligenceLatency: duration });
            }
            
        } catch (error) {
            console.error('[IntelligenceFetcher] Failed to fetch intelligence snapshot:', error);
            setOverallStatus('critical');
        } finally {
            setAnalyzing(false);
            isFetching.current = false;
        }
    };

    // Main polling interval effect
    useEffect(() => {
        if (globalThis.__INTEL_INITIALIZED__) {
          return;
        }
        globalThis.__INTEL_INITIALIZED__ = true;

        console.log("INTELLIGENCE FETCHER INITIALIZED");

        const poll = () => {
            if (useIntelligenceStore.getState().isPipelineActive) {
                fetchIntelligence();
            }
        };

        // Initial fetch if active
        poll();
        
        // Setup interval
        globalThis.__INTEL_POLLING_ID__ = setInterval(poll, ANALYSIS_INTERVAL);
        
    }, []);

    // Event-driven analysis trigger
    useEffect(() => {
        const lastEvent = events[0];

        // Check for a new, significant event
        if (lastEvent && lastEvent.timestamp > lastEventTimestamp.current && (lastEvent.impact === 'HIGH' || lastEvent.impact === 'CRITICAL')) {
            console.log(`[IntelligenceFetcher] Significant market event detected: ${lastEvent.content}. Triggering on-demand analysis.`);
            lastEventTimestamp.current = lastEvent.timestamp;
            // The server-side aiGuard will prevent spamming if events fire in quick succession.
            fetchIntelligence();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [events]);


    return null; // This component doesn't render anything
}
