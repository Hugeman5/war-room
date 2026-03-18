
import type { AlphaEngine, AlphaSignal } from '../types';
import { fetchOpenInterestHistory } from '@/market/data';

export const OpenInterestShockEngine: AlphaEngine = {
    name: 'OpenInterestShock',
    async run(): Promise<Omit<AlphaSignal, 'name'>> {
        const history = await fetchOpenInterestHistory();
        if (!history || history.length < 2) {
            return { signal: 'neutral', strength: 0, confidence: 0 };
        }
        
        const latest = history[history.length - 1];
        const prev = history[history.length - 2];
        const change = (latest - prev) / prev;
        
        // Significant OI drop is a neutral/reversal signal (trap)
        // Significant OI rise is a continuation signal (fuel)
        // For simplicity, we'll just report the strength and keep signal neutral as it's contextual
        if (Math.abs(change) > 0.02) { // 2% shock
             return {
                signal: 'neutral',
                strength: Math.min(1, Math.abs(change) * 10),
                confidence: 0.6,
            };
        }

        return { signal: 'neutral', strength: 0, confidence: 0.5 };
    },
};
