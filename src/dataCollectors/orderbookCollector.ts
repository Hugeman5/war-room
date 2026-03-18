
import { db } from './database';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

async function fetchOrderBookSnapshot() {
  const url = `https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=1000`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[OrderbookCollector] Binance depth API request failed with status: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('[OrderbookCollector] Failed to fetch from Binance depth API:', error);
    return null;
  }
}

/**
 * Collects an order book snapshot and stores it as a single document.
 */
export async function collectOrderbookSnapshot() {
    console.log('[OrderbookCollector] Starting order book snapshot collection...');
    const snapshot = await fetchOrderBookSnapshot();

    if (!snapshot) {
        console.log('[OrderbookCollector] Failed to fetch snapshot.');
        return;
    }

    if (!isFirebaseConfigured) {
        console.warn('[OrderbookCollector] Firebase not configured. Skipping Firestore write.');
        return;
    }

    const snapshotCollection = collection(db, 'orderbook_snapshots');
    await addDoc(snapshotCollection, {
        ...snapshot,
        collectedAt: serverTimestamp(),
    });


    console.log(`[OrderbookCollector] Successfully collected order book snapshot with last update ID ${snapshot.lastUpdateId}.`);
}
