
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, FastForward, RotateCcw, SlidersHorizontal, ListVideo } from 'lucide-react';
import { useReplayStore, type ReplayScenario } from '@/store/replayStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const speedOptions = [1, 2, 5, 10, 25, 50];
const scenarioOptions: { label: string; value: ReplayScenario }[] = [
    { label: 'FTX Collapse (Nov 2022)', value: 'FTX_COLLAPSE_2022' },
    { label: 'COVID Crash (Mar 2020)', value: 'COVID_CRASH_2020' },
    { label: 'ETF Volatility (Jan 2024)', value: 'ETF_VOLATILITY_2024' },
    { label: 'High Volatility Range', value: 'HIGH_VOL_RANGE' },
];

export default function ReplayControlPanel() {
    const { isActive, isPlaying, speed, scenario, progress, actions, historicalData } = useReplayStore();

    const dataLoaded = historicalData.length > 0;
    const isAtEnd = progress >= 100;

    const handlePlayPause = () => {
        if (isAtEnd) {
            actions.reset();
            actions.play();
        } else if (isPlaying) {
            actions.pause();
        } else {
            actions.play();
        }
    };

    return (
        <Card className="tactical-card h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="tactical-title">Market Replay Engine</CardTitle>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="replay-mode" className="text-xs text-muted-foreground">OFF</Label>
                    <Switch 
                        id="replay-mode"
                        checked={isActive}
                        onCheckedChange={actions.toggleReplay}
                    />
                     <Label htmlFor="replay-mode" className="text-xs text-primary">ON</Label>
                </div>
            </CardHeader>
            <CardContent className={!isActive ? 'opacity-40 pointer-events-none' : ''}>
                <div className="space-y-4">
                    <div>
                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-widest flex items-center gap-2 mb-2">
                            <ListVideo className="h-4 w-4" />
                            Scenario
                        </Label>
                        <Select 
                            value={scenario} 
                            onValueChange={(v) => actions.setScenario(v as ReplayScenario)}
                            disabled={isPlaying}
                        >
                            <SelectTrigger className="bg-background/50 font-mono h-9 border-primary/30">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {scenarioOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-widest flex items-center gap-2 mb-2">
                            <SlidersHorizontal className="h-4 w-4" />
                            Controls
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                             <Button variant="outline" size="sm" onClick={handlePlayPause} disabled={!dataLoaded}>
                                { isPlaying ? <Pause /> : <Play /> }
                                <span>{ isPlaying ? 'Pause' : isAtEnd ? 'Replay' : 'Play' }</span>
                            </Button>
                             <Button variant="outline" size="sm" onClick={actions.reset}>
                                <RotateCcw />
                                <span>Reset</span>
                             </Button>
                             <Select value={String(speed)} onValueChange={(v) => actions.setSpeed(Number(v))}>
                                <SelectTrigger className="bg-background/50 font-mono h-9 border-primary/30 text-xs">
                                    <FastForward className="h-4 w-4 mr-1" /> <SelectValue />x
                                </SelectTrigger>
                                <SelectContent>
                                    {speedOptions.map(s => (
                                        <SelectItem key={s} value={String(s)}>{s}x</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                         <div className="flex justify-between items-center mb-1">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-widest">
                                Progress
                            </Label>
                            <span className="text-xs font-mono text-muted-foreground">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
