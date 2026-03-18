import type { WarRoomRuntime } from './warroomRuntime';
import type { runWarRoomDiagnostics } from '@/debug/warroomDiagnostics';

declare global {
  // For HMR and diagnostics
  var __WARROOM_RUNTIME__: WarRoomRuntime | undefined;

  // For console command
  interface Window {
    warroom?: {
      diagnostics: typeof runWarRoomDiagnostics;
    };
  }
}

export {};
