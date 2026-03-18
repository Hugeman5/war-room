import type { Candle } from '@/lib/candle-builder';
import type { MarketStructureEvent } from './schemas';
import type { MarketEvent } from '@/store/marketEventStore';
import type { Trade } from '@/intelligence/data';
import { formatPrice } from '@/lib/priceFormatter';

// --- Volatility Spike Detection ---
export function detectVolatilityEvents(candles: Candle[], prevCandle: Candle | null): MarketEvent[] {
  if (candles.length < 2 || !prevCandle) return [];
  const currentCandle = candles[candles.length - 1];
  const events: MarketEvent[] = [];

  const avgRange = candles.slice(0, -1).reduce((acc, c) => acc + (c.high - c.low), 0) / (candles.length - 1);
  const currentRange = currentCandle.high - currentCandle.low;

  if (currentRange > avgRange * 2.5 && currentCandle.time > prevCandle.time) {
    events.push({
      id: `vol-${currentCandle.time}`,
      timestamp: Date.now(),
      type: 'VOLATILITY',
      time: currentCandle.time,
      content: `Volatility Expansion detected. Candle range is ${(((currentRange/avgRange)-1)*100).toFixed(0)}% above average.`,
      impact: 'MEDIUM',
    });
  }

  return events;
}

// --- Liquidity Sweep Detection ---
export function detectLiquidityEvents(structureEvents: MarketStructureEvent[], prevEvents: MarketStructureEvent[]): MarketEvent[] {
  const newStructureEvents = structureEvents.filter(e => !prevEvents.some(pe => pe.id === e.id));
  if (newStructureEvents.length === 0) return [];
  
  const events: MarketEvent[] = [];

  newStructureEvents.forEach(event => {
    if (event.type === 'CHOCH') {
        events.push({
            id: `liq-${event.time}-${event.type}`,
            timestamp: Date.now(),
            type: 'LIQUIDITY',
            time: event.time,
            priceLevel: event.price,
            content: `Potential liquidity sweep: Change of Character (${event.direction}) at ${formatPrice(event.price)}.`,
            impact: 'HIGH',
            details: {
                eventType: 'CHOCH',
                direction: event.direction
            }
        });
    } else if (event.type === 'BOS') {
         events.push({
            id: `liq-${event.time}-${event.type}`,
            timestamp: Date.now(),
            type: 'LIQUIDITY',
            time: event.time,
            priceLevel: event.price,
            content: `Market structure break (${event.direction}) at ${formatPrice(event.price)}.`,
            impact: 'MEDIUM',
            details: {
                eventType: 'BOS',
                direction: event.direction
            }
        });
    }
  });

  return events;
}

// Note: Order Book Imbalances and on-chain analysis are not possible with current data sources.
// Macro event detection from news is complex; for now, we'll just show news in its own panel.
