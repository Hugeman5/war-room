export interface Candle {
  time: number; // Unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

const timeframeToSeconds: Record<Timeframe, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '4h': 14400,
  '1d': 86400,
};

export function updateCandles(
  trade: { price: number; quantity: number; time: number },
  timeframe: Timeframe,
  candles: Candle[]
): Candle[] {
  const period = timeframeToSeconds[timeframe];
  const tradeTimestamp = Math.floor(trade.time / 1000); // work with seconds
  const candleTimestamp = Math.floor(tradeTimestamp / period) * period;

  const newCandles = [...candles];
  const lastCandle = newCandles.length > 0 ? newCandles[newCandles.length - 1] : null;

  if (lastCandle && lastCandle.time === candleTimestamp) {
    // Update the current candle
    lastCandle.high = Math.max(lastCandle.high, trade.price);
    lastCandle.low = Math.min(lastCandle.low, trade.price);
    lastCandle.close = trade.price;
    lastCandle.volume += trade.quantity;
    newCandles[newCandles.length - 1] = { ...lastCandle };
  } else {
    // Start a new candle (close previous one implicitly)
    const newCandle: Candle = {
      time: candleTimestamp,
      open: trade.price,
      high: trade.price,
      low: trade.price,
      close: trade.price,
      volume: trade.quantity,
    };
    newCandles.push(newCandle);
  }

  // Maintain buffer of 500 candles
  if (newCandles.length > 500) {
    return newCandles.slice(newCandles.length - 500);
  }

  return newCandles;
}
