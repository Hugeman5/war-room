
import type { AlphaEngine, AlphaSignal } from '../types';
import { fetchFundingRateHistory } from '@/market/data';

export const FundingPressureEngine: AlphaEngine = {
    name: 'FundingPressure',
    async run(): Promise<Omit<AlphaSignal, 'name'>> {
        const history = await fetchFundingRateHistory();
        if (!history || history.length === 0) {
            return { signal: 'neutral', strength: 0, confidence: 0 };
        }

        const latest = history[history.length - 1];
        
        // Very high positive funding (longs paying shorts) is a bearish contrarian signal.
        if (latest > 0.001) { // 0.1% is quite high
            return {
                signal: 'bearish',
                strength: Math.min(1, latest / 0.002),
                confidence: 0.8,
            };
        }

        // Very low negative funding (shorts paying longs) is a bullish contrarian signal.
        if (latest < -0.001) {
            return {
                signal: 'bullish',
                strength: Math.min(1, Math.abs(latest) / 0.002),
                confidence: 0.8,
            };
        }

        return { signal: 'neutral', strength: 0, confidence: 0.5 };
    },
};
