
import { db } from './database';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

type RawTrade = {
  id: number;
  price: number;
  qty: number;
  time: number;
  side: 'buy' | 'sell';
};

/**
 * Fetches recent trades for BTC/USDT from Binance.
 */
async function fetchRecentTrades(limit = 1000): Promise<RawTrade[]> {
  const url = `https://api.binance.com/api/v3/trades?symbol=BTCUSDT&limit=${limit}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[TradesCollector] Binance trades API request failed with status: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.map((t: any) => ({
      id: t.id,
      price: parseFloat(t.price),
      qty: parseFloat(t.qty),
      time: t.time,
      // if buyer is maker, aggressive side is sell
      side: t.isBuyerMaker ? 'sell' : 'buy',
    }));
  } catch (error) {
    console.error('[TradesCollector] Failed to fetch from Binance trades API:', error);
    return [];
  }
}

/**
 * Collects recent trades and stores them.
 * This function is designed to be run on a schedule (e.g., a cron job).
 */
export async function collectTrades() {
    console.log('[TradesCollector] Starting trade collection...');
    const trades = await fetchRecentTrades();

    if (trades.length === 0) {
        console.log('[TradesCollector] No new trades found.');
        return;
    }

    if (!isFirebaseConfigured) {
        console.warn('[TradesCollector] Firebase not configured. Skipping Firestore write.');
        return;
    }

    const tradesCollection = collection(db, 'market_trades');
    
    // In a real production system, you'd check for the last stored trade ID
    // to prevent writing duplicates. For this example, we assume new trades are fetched.
    const promises = trades.map(trade => {
        const tradeData = {
            timestamp: Timestamp.fromMillis(trade.time),
            price: trade.price,
            volume: trade.qty,
            side: trade.side,
        };
        return addDoc(tradesCollection, tradeData);
    });

    await Promise.all(promises);

    console.log(`[TradesCollector] Successfully collected and stored ${trades.length} trades.`);
}
