
import type { Candle } from '@/lib/candle-builder';
import type { MarketStructure, SwingPoint, LiquidityMap } from '../schemas';
import { formatPrice } from '@/lib/priceFormatter';

function findEqualHighs(swingPoints: SwingPoint[], lookback: number, tolerance: number): number | null {
    const highs = swingPoints.filter(p => p.type === 'high').slice(-lookback);
    if (highs.length < 2) return null;

    for (let i = highs.length - 1; i > 0; i--) {
        const diff = Math.abs(highs[i].price - highs[i - 1].price);
        const avgPrice = (highs[i].price + highs[i - 1].price) / 2;
        if (diff / avgPrice < tolerance) {
            return Math.max(highs[i].price, highs[i - 1].price);
        }
    }
    return null;
}

function findEqualLows(swingPoints: SwingPoint[], lookback: number, tolerance: number): number | null {
    const lows = swingPoints.filter(p => p.type === 'low').slice(-lookback);
    if (lows.length < 2) return null;

    for (let i = lows.length - 1; i > 0; i--) {
        const diff = Math.abs(lows[i].price - lows[i - 1].price);
        const avgPrice = (lows[i].price + lows[i - 1].price) / 2;
        if (diff / avgPrice < tolerance) {
            return Math.min(lows[i].price, lows[i-1].price);
        }
    }
    return null;
}

export function analyzeLiquidityMap(
  candles: Candle[],
  structure: MarketStructure,
  orderBook: any | null
): LiquidityMap {
    const lastCandle = candles[candles.length - 1];
    if (!lastCandle || !structure.lastHigh || !structure.lastLow) {
        return {
            liquidityAbove: 0,
            liquidityBelow: 0,
            equalHighs: false,
            equalLows: false,
            nearestPool: 'above',
            density: 'low',
            sweepProbability: 0,
            stopClusters: {
                above: 0,
                below: 0,
            },
            description: 'Insufficient data for liquidity map.'
        };
    }

    const equalHighsPrice = findEqualHighs(structure.swingPoints, 5, 0.001);
    const equalLowsPrice = findEqualLows(structure.swingPoints, 5, 0.001);

    const findLargestPool = (orders: [string, string][], lookback: number) => {
        if (!orders || orders.length < lookback) return null;
        const relevantOrders = orders.slice(0, lookback).map(([price, size]) => ({ price: parseFloat(price), size: parseFloat(size) }));
        return relevantOrders.sort((a,b) => b.size - a.size)[0];
    };
    
    const largestBuysidePool = findLargestPool(orderBook?.asks, 50); // Asks are sell orders, creating resistance (liquidity above)
    const largestSellsidePool = findLargestPool(orderBook?.bids, 50); // Bids are buy orders, creating support (liquidity below)

    const liquidityAbove = largestBuysidePool?.price ?? (equalHighsPrice || structure.lastHigh.price);
    const liquidityBelow = largestSellsidePool?.price ?? (equalLowsPrice || structure.lastLow.price);

    const stopClusterAbove = liquidityAbove * 1.001;
    const stopClusterBelow = liquidityBelow * 0.999;
    
    const recentRange = (structure.lastHigh.price - structure.lastLow.price) / structure.lastHigh.price;
    let density: 'low' | 'medium' | 'high' = 'medium';
    if (recentRange < 0.02) density = 'high';
    if (recentRange > 0.05) density = 'low';
    
    const distanceToAbove = Math.abs(lastCandle.close - liquidityAbove);
    const distanceToBelow = Math.abs(lastCandle.close - liquidityBelow);
    const nearestPool = distanceToAbove < distanceToBelow ? 'above' : 'below';

    let sweepProbability = (density === 'high') ? 0.6 : 0.3;
    const proximityFactor = nearestPool === 'above' ? (lastCandle.close / liquidityAbove) : (liquidityBelow / lastCandle.close);
    if (proximityFactor > 0.99) {
        sweepProbability = Math.min(0.9, sweepProbability + 0.3);
    }
    
    let description = `Key liquidity rests at ${formatPrice(liquidityAbove)} (above) and ${formatPrice(liquidityBelow)} (below), based on live order book analysis. `;
    if (equalHighsPrice) description += 'Chart also shows equal highs, forming a structural buy-side pool. ';
    if (equalLowsPrice) description += 'Chart also shows equal lows, forming a structural sell-side pool. ';
    description += `The market is currently closer to the ${nearestPool} liquidity pool.`;


    return {
        liquidityAbove,
        liquidityBelow,
        equalHighs: !!equalHighsPrice,
        equalLows: !!equalLowsPrice,
        nearestPool,
        density,
        sweepProbability,
        stopClusters: {
            above: stopClusterAbove,
            below: stopClusterBelow,
        },
        description,
    };
}
