
import {
    fetchBTCCandles,
    fetchBTCOrderBook,
    fetchLiquidations,
    fetchFundingRateHistory,
    fetchOpenInterestHistory
} from '@/market/data';
import type { Candle } from '@/lib/candle-builder';

export type AiFeatureVector = {
    orderbookImbalance: number;  // -1 (sell heavy) to 1 (buy heavy)
    liquidationPressure: number; // 0-1, normalized value of recent liquidations
    fundingPressure: number;     // The raw funding rate (e.g., 0.0001)
    oiMomentum: number;          // % change in Open Interest
    volatility: number;          // 0-100 score
    priceMomentum: number;       // % change in price over a period
};

/**
 * Calculates orderbook imbalance.
 * @param orderbook Raw orderbook data from Binance.
 * @returns A number between -1 and 1.
 */
function calculateOrderbookImbalance(orderbook: any): number {
    if (!orderbook || !orderbook.bids || !orderbook.asks) return 0;
    const bidVolume = orderbook.bids.reduce((sum: number, b: [string, string]) => sum + Number(b[1]), 0);
    const askVolume = orderbook.asks.reduce((sum: number, a: [string, string]) => sum + Number(a[1]), 0);
    const totalVolume = bidVolume + askVolume;
    if (totalVolume === 0) return 0;
    return (bidVolume - askVolume) / totalVolume;
}

/**
 * Calculates recent liquidation pressure.
 * @param liquidations Array of liquidation events.
 * @returns A normalized score from 0 to 1.
 */
function calculateLiquidationPressure(liquidations: { value: number }[]): number {
    if (!liquidations || liquidations.length === 0) return 0;
    const totalValue = liquidations.reduce((sum, l) => sum + l.value, 0);
    // Normalize based on a "large" cascade value, e.g., $2M
    return Math.min(1, totalValue / 2_000_000);
}

/**
 * Gets the latest funding rate.
 * @param fundingHistory Array of historical funding rates.
 * @returns The latest funding rate.
 */
function getFundingPressure(fundingHistory: number[]): number {
    if (!fundingHistory || fundingHistory.length === 0) return 0;
    return fundingHistory[fundingHistory.length - 1];
}

/**
 * Calculates open interest momentum.
 * @param oiHistory Array of historical open interest values.
 * @returns The percentage change between the last two data points.
 */
function calculateOiMomentum(oiHistory: number[]): number {
    if (!oiHistory || oiHistory.length < 2) return 0;
    const latest = oiHistory[oiHistory.length - 1];
    const prev = oiHistory[oiHistory.length - 2];
    if (prev === 0) return 0;
    return (latest - prev) / prev;
}

/**
 * Calculates a volatility score.
 * @param candles Array of recent candles.
 * @returns A score from 0 to 100.
 */
function calculateVolatility(candles: Candle[]): number {
    if (candles.length < 20) return 0;
    const recentCandles = candles.slice(-20);
    const avgPrice = recentCandles.reduce((sum, c) => sum + c.close, 0) / recentCandles.length;
    if (avgPrice === 0) return 0;
    const recentRange = Math.max(...recentCandles.map(c => c.high)) - Math.min(...recentCandles.map(c => c.low));
    const normalizedRange = recentRange / avgPrice;
    // Normalize based on 5% being a high volatility range
    return Math.min(100, (normalizedRange / 0.05) * 100);
}

/**
 * Calculates price momentum over a period.
 * @param candles Array of recent candles.
 * @param period The number of candles to look back.
 * @returns The percentage change in price.
 */
function calculatePriceMomentum(candles: Candle[], period: number = 14): number {
    if (candles.length < period) return 0;
    const currentPrice = candles[candles.length - 1].close;
    const pastPrice = candles[candles.length - 1 - period].close;
    if (pastPrice === 0) return 0;
    return (currentPrice - pastPrice) / pastPrice;
}


/**
 * The main feature builder function. It fetches all necessary raw data,
 * processes it into a structured feature vector for AI model consumption.
 * @returns A promise that resolves to the AiFeatureVector.
 */
export async function buildFeatureVector(): Promise<AiFeatureVector> {
    console.log('[FeatureBuilder] Starting feature vector construction...');

    // 1. Fetch all raw data in parallel
    const [
        orderbook,
        liquidations,
        fundingHistory,
        oiHistory,
        candles
    ] = await Promise.all([
        fetchBTCOrderBook(),
        fetchLiquidations(),
        fetchFundingRateHistory(),
        fetchOpenInterestHistory(),
        fetchBTCCandles('15m')
    ]);

    const typedCandles: Candle[] = candles.map((c) => ({
        time: c.timestamp / 1000,
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
        volume: parseFloat(c.volume),
    }));

    // 2. Calculate each feature from the raw data
    const featureVector: AiFeatureVector = {
        orderbookImbalance: calculateOrderbookImbalance(orderbook),
        liquidationPressure: calculateLiquidationPressure(liquidations),
        fundingPressure: getFundingPressure(fundingHistory),
        oiMomentum: calculateOiMomentum(oiHistory),
        volatility: calculateVolatility(typedCandles),
        priceMomentum: calculatePriceMomentum(typedCandles),
    };

    console.log('[FeatureBuilder] Feature vector constructed successfully.');
    
    return featureVector;
}
