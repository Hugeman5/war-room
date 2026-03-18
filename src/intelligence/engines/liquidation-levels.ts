
import type { Candle } from '@/lib/candle-builder';
import type { MarketStructure, LiquidationHeatmap, LiquidationCluster } from '../schemas';
import { formatPrice } from '@/lib/priceFormatter';

// This is a derived/simulated engine. A real implementation would connect to an exchange's liquidation feed.
export function analyzeLiquidationLevels(
  candles: Candle[],
  structure: MarketStructure
): LiquidationHeatmap {
    if (!structure.lastHigh || !structure.lastLow || candles.length === 0) {
        return {
            longLiquidations: [],
            shortLiquidations: [],
            description: "Insufficient data for liquidation analysis."
        };
    }
    
    const lastPrice = candles[candles.length - 1].close;

    const shortLiquidationLevels = structure.swingPoints
        .filter(p => p.type === 'high' && p.price > lastPrice)
        .slice(-5);
        
    const longLiquidationLevels = structure.swingPoints
        .filter(p => p.type === 'low' && p.price < lastPrice)
        .slice(-5);

    const shortLiquidations: LiquidationCluster[] = shortLiquidationLevels.map(p => ({
        price: p.price * 1.001,
        size: Math.random() * 50 + 10
    }));

    const longLiquidations: LiquidationCluster[] = longLiquidationLevels.map(p => ({
        price: p.price * 0.999,
        size: Math.random() * 50 + 10
    }));
    
    const highestShortLiq = Math.max(...shortLiquidations.map(l => l.price), 0);
    const lowestLongLiq = Math.min(...longLiquidations.map(l => l.price), Infinity);

    // --- Calculate Cluster Density ---
    let clusterDensity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    const shortLiqRange = highestShortLiq - Math.min(...shortLiquidations.map(l => l.price), Infinity);
    const longLiqRange = Math.max(...longLiquidations.map(l => l.price), 0) - lowestLongLiq;
    if (shortLiquidations.length > 2 && (shortLiqRange / lastPrice) < 0.01) {
        clusterDensity = 'HIGH';
    } else if (longLiquidations.length > 2 && (longLiqRange / lastPrice) < 0.01) {
        clusterDensity = 'HIGH';
    } else if (shortLiquidations.length > 1 || longLiquidations.length > 1) {
        clusterDensity = 'MEDIUM';
    }

    // --- Calculate Cascade Risk Score ---
    let cascadeRiskScore = 0;
    const totalShortLiqSize = shortLiquidations.reduce((sum, l) => sum + l.size, 0);
    const totalLongLiqSize = longLiquidations.reduce((sum, l) => sum + l.size, 0);
    
    const distanceToShorts = highestShortLiq > 0 ? (highestShortLiq - lastPrice) / lastPrice : Infinity;
    const distanceToLongs = lowestLongLiq < Infinity ? (lastPrice - lowestLongLiq) / lastPrice : Infinity;

    if (distanceToShorts < 0.02) { // Within 2% of short liquidations
        cascadeRiskScore += (totalShortLiqSize / 100) * 50; // Use size as a factor
    }
     if (distanceToLongs < 0.02) { // Within 2% of long liquidations
        cascadeRiskScore += (totalLongLiqSize / 100) * 50;
    }
    if (clusterDensity === 'HIGH') cascadeRiskScore += 20;

    const description = `Potential short liquidations cluster around ${formatPrice(highestShortLiq)}. Potential long liquidations cluster near ${formatPrice(lowestLongLiq)}.`;

    return {
        longLiquidations,
        shortLiquidations,
        description,
        clusterDensity,
        cascadeRiskScore: Math.min(100, Math.round(cascadeRiskScore)),
    };
}
