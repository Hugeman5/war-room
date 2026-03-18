
import type { AlphaEngine } from './types';
import { WhaleTrackerEngine } from './engines/WhaleTrackerEngine';
import { LiquidationHeatmapEngine } from './engines/LiquidationHeatmapEngine';
import { FundingPressureEngine } from './engines/FundingPressureEngine';
import { OpenInterestShockEngine } from './engines/OpenInterestShockEngine';
import { OptionsGammaEngine } from './engines/OptionsGammaEngine';

export const alphaRegistry: AlphaEngine[] = [
    WhaleTrackerEngine,
    LiquidationHeatmapEngine,
    FundingPressureEngine,
    OpenInterestShockEngine,
    OptionsGammaEngine,
];
