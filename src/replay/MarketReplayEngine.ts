import type { Candle } from '@/lib/candle-builder';

export type SimulatedTick = {
    price: number;
    quantity: number;
    time: number; // ms timestamp
};

// This function simulates a stream of ticks from a single candle.
export function simulateTicksForCandle(candle: Candle, durationMs: number, ticksPerCandle: number): SimulatedTick[] {
    const ticks: SimulatedTick[] = [];
    const { open, high, low, close, time, volume } = candle;
    const timeIncrement = durationMs / ticksPerCandle;
    const volumePerTick = volume / ticksPerCandle;

    // A simple, predictable pattern for tick generation: Open -> High -> Low -> Close
    const path = [open, high, low, close];
    const segments = path.length - 1;
    const ticksPerSegment = Math.floor(ticksPerCandle / segments);
    
    let tickTime = time * 1000;

    for(let i = 0; i < segments; i++) {
        const startPrice = path[i];
        const endPrice = path[i+1];
        const priceIncrement = (endPrice - startPrice) / ticksPerSegment;

        for (let j = 0; j < ticksPerSegment; j++) {
            ticks.push({
                price: startPrice + (priceIncrement * j),
                quantity: volumePerTick,
                time: tickTime
            });
            tickTime += timeIncrement;
        }
    }
    
    // Add the final closing tick
    ticks.push({
        price: close,
        quantity: volumePerTick,
        time: (time * 1000) + durationMs
    });

    return ticks;
}
