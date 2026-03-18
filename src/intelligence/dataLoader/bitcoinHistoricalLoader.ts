
// Define the structure for a single data point
export type BtcDataPoint = {
  date: string; // Using string to ensure serializability from server to client
  price: number;
  market_cap: number;
  volume: number;
};

/**
 * Fetches the full historical data for Bitcoin from the CoinGecko API.
 */
export async function loadBitcoinHistoricalData(): Promise<BtcDataPoint[]> {
  // Use the public API endpoint without a key to avoid authentication issues.
  const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=max`;

  try {
    // Next.js extends fetch to provide caching and revalidation.
    // This will cache the result and re-fetch it at most once every 24 hours.
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();

    if (!data.prices || !data.market_caps || !data.total_volumes) {
      return [];
    }

    const btcHistory: BtcDataPoint[] = data.prices.map((entry: [number, number], index: number) => ({
      date: new Date(entry[0]).toISOString(), // Use ISO string for serialization
      price: entry[1],
      market_cap: data.market_caps[index] ? data.market_caps[index][1] : 0,
      volume: data.total_volumes[index] ? data.total_volumes[index][1] : 0,
    }));
    
    console.log("Bitcoin historical dataset loaded successfully.");
    console.log(`Records loaded: ${btcHistory.length}`);

    return btcHistory;
  } catch (error) {
    // In case of an error, return an empty array to prevent the app from crashing.
    return [];
  }
}
