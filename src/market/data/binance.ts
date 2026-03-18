
export type Trade = {
  id: number;
  price: number;
  quantity: number;
  time: string;
};

export type BtcCandle = {
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

/**
 * Fetches the current live price for BTC/USDT from Binance.
 */
export async function fetchBTCPrice(): Promise<number | null> {
  const url = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Binance price API request failed with status: ${response.status}`);
      return null;
    }
    const data = await response.json();
    console.log("Binance BTC price feed connected");
    return Number(data.price);
  } catch (error) {
    console.error('Failed to fetch from Binance price API:', error);
    return null;
  }
}

/**
 * Fetches historical candles for BTC/USDT from Binance.
 */
export async function fetchBTCCandles(interval: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d'): Promise<BtcCandle[]> {
  const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=500`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Binance klines API request failed with status: ${response.status}`);
      return [];
    }
    const data = await response.json();
    const candles: BtcCandle[] = data.map((k: any) => ({
      timestamp: k[0],
      open: k[1],
      high: k[2],
      low: k[3],
      close: k[4],
      volume: k[5],
    }));
    console.log(`Binance historical ${interval} candles loaded`);
    return candles;
  } catch (error) {
    console.error(`Failed to fetch from Binance ${interval} klines API:`, error);
    return [];
  }
}


/**
 * Fetches the current order book depth for BTC/USDT from Binance.
 */
export async function fetchBTCOrderBook() {
  const url = `https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=100`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Binance depth API request failed with status: ${response.status}`);
      return null;
    }
    const data = await response.json();
    console.log(`Binance order book loaded.`);
    return data;
  } catch (error) {
    console.error('Failed to fetch from Binance depth API:', error);
    return null;
  }
}
