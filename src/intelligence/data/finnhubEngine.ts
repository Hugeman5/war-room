
export type FinnhubNews = {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
};

/**
 * Fetches crypto news for BTC from Finnhub.
 */
export async function fetchBTCNews(): Promise<FinnhubNews[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.warn('Finnhub API key not found. Skipping news fetch.');
    return [{
        id: 0,
        headline: 'Finnhub API Key not configured. Please add FINNHUB_API_KEY to your .env.local file.',
        category: 'system',
        datetime: Date.now() / 1000,
        source: 'War Room',
        url: '#',
        summary: '',
        image: '',
        related: ''
    }];
  }

  const url = `https://finnhub.io/api/v1/crypto/news?symbol=BINANCE:BTCUSDT&token=${apiKey}`;
  
  try {
    const response = await fetch(url); 
    if (!response.ok) {
      console.error(`Finnhub news API request failed with status: ${response.status}`);
      return [];
    }
    const data = await response.json();
    console.log("Finnhub crypto news feed connected");
    // Finnhub returns an array of news items.
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch from Finnhub news API:', error);
    return [];
  }
}
