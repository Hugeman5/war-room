
import type { ReplayScenario } from '@/store/replayStore';
import type { BtcCandle } from '@/market/data';
import type { Candle } from '@/lib/candle-builder';

type ScenarioConfig = {
    start: string;
    end: string;
};

// These dates are approximate for the historical events
const SCENARIO_DATES: Record<ReplayScenario, ScenarioConfig> = {
    FTX_COLLAPSE_2022: { start: '2022-11-06', end: '2022-11-12' },
    COVID_CRASH_2020: { start: '2020-03-09', end: '2020-03-15' },
    ETF_VOLATILITY_2024: { start: '2024-01-08', end: '2024-01-14' },
    HIGH_VOL_RANGE: { start: '2023-06-15', end: '2023-06-21' },
};

const INTERVAL = '15m';

export async function fetchScenarioData(scenario: ReplayScenario): Promise<Candle[]> {
    const config = SCENARIO_DATES[scenario];
    const startTime = new Date(config.start).getTime();
    const endTime = new Date(config.end).getTime();

    console.log(`[ReplayEngine] Fetching data for ${scenario} from ${new Date(startTime).toUTCString()} to ${new Date(endTime).toUTCString()}`);
    
    const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${INTERVAL}&startTime=${startTime}&endTime=${endTime}&limit=1000`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Binance klines API request failed for replay data: ${response.status}`);
            return [];
        }
        const data = await response.json();
        const candles: Candle[] = data.map((k: any) => ({
            time: k[0] / 1000,
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
        })).sort((a: Candle, b: Candle) => a.time - b.time);

        console.log(`[ReplayEngine] Loaded ${candles.length} historical candles for ${scenario}.`);
        return candles;

    } catch (error) {
        console.error(`[ReplayEngine] Failed to fetch historical data for ${scenario}:`, error);
        return [];
    }
}
