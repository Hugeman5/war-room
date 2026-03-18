
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutGrid, Map, Flame, Anchor, Gauge, Zap, FlaskConical, History, Atom } from 'lucide-react';
import dynamic from 'next/dynamic';

const LiquidityMapPanel = dynamic(() => import('@/components/intelligence/liquidity-intel-panel'));
const LiquidationHeatmapPanel = dynamic(() => import('@/components/intelligence/LiquidationHeatmapPanel'));
const WhaleTrackerPanel = dynamic(() => import('@/components/intelligence/WhaleRadarPanel'));
const MarketReplayPanel = dynamic(() => import('@/replay/ReplayControlPanel'));
const AlphaIntelPanel = dynamic(() => import('@/components/warroom/AlphaIntelPanel'));

const ComingSoonPanel = ({ title }: { title: string }) => (
    <div className="p-4 text-sm text-muted-foreground">
        The "{title}" component is under development.
    </div>
);

const toolRegistry = {
    alphaIntel: { label: 'Alpha Intelligence', icon: Atom, component: AlphaIntelPanel },
    liquidityMap: { label: 'Liquidity Map', icon: Map, component: LiquidityMapPanel },
    liquidationHeatmap: { label: 'Liquidation Heatmap', icon: Flame, component: LiquidationHeatmapPanel },
    whaleTracker: { label: 'Whale Tracker', icon: Anchor, component: WhaleTrackerPanel },
    fundingPressure: { label: 'Funding Pressure', icon: Gauge, component: () => <ComingSoonPanel title="Funding Pressure" /> },
    openInterest: { label: 'Open Interest Shock', icon: Zap, component: () => <ComingSoonPanel title="Open Interest Shock" /> },
    marketReplay: { label: 'Market Replay', icon: History, component: MarketReplayPanel },
    scenarioLab: { label: 'Scenario Lab', icon: FlaskConical, component: () => <ComingSoonPanel title="Scenario Lab" /> },
} as const;

export default function ToolDock() {
    return (
        <Card className="tactical-card h-full flex flex-col">
            <CardHeader>
                <CardTitle className="tactical-title flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Analysis Tools
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex-1 overflow-y-auto no-scrollbar">
                <Accordion type="multiple" className="w-full" defaultValue={['alphaIntel']}>
                    {Object.entries(toolRegistry).map(([id, { label, icon: Icon, component: Component }]) => (
                        <AccordionItem value={id} key={id} className="border-b-0">
                            <AccordionTrigger className="py-2 px-3 hover:no-underline hover:bg-card rounded-md text-sm font-semibold uppercase text-muted-foreground tracking-widest [&[data-state=open]]:text-primary">
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 px-1">
                                <Component />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
