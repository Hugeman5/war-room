'use client';

import ReplayControlPanel from "@/replay/ReplayControlPanel";
import DiagnosticsPanel from "./diagnostics-panel";
import CommandConsolePanel from '../intelligence/CommandConsolePanel';

export default function BottomPanels() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReplayControlPanel />
            <DiagnosticsPanel />
            <CommandConsolePanel />
        </div>
    )
}
