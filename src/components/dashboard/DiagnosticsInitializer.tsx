'use client';

import { useEffect } from 'react';
import { runWarRoomDiagnostics } from '@/debug/warroomDiagnostics';

export default function DiagnosticsInitializer() {
  useEffect(() => {
    // Ensure this only runs on the client
    if (typeof window !== 'undefined') {
      // Initialize console command
      window.warroom = {
        diagnostics: runWarRoomDiagnostics,
      };
      console.log('War Room Diagnostics Initialized. Run `warroom.diagnostics()` in the console for a full pipeline status report.');
      
      // Initialize global runtime for diagnostics if it doesn't exist
      if (process.env.NODE_ENV === 'development') {
        if (!globalThis.__WARROOM_RUNTIME__) {
          globalThis.__WARROOM_RUNTIME__ = {};
        }
        if (!globalThis.__WARROOM_RUNTIME__.startTime) {
            globalThis.__WARROOM_RUNTIME__.startTime = Date.now();
            globalThis.__WARROOM_RUNTIME__.marketFeedStatus = 'OFFLINE';
            globalThis.__WARROOM_RUNTIME__.engineStatus = {};
        }
      }
    }
  }, []);

  return null; // This component doesn't render anything
}
