
import { db } from './database';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

type OpenInterestHistItem = {
    sumOpenInterest: string;
    sumOpenInterestValue: string;
    timestamp: number;
};

async function fetchLatestOpenInterest(): Promise<OpenInterestHistItem | null> {
    const url = 'https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=5m&limit=1';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[OpenInterestCollector] Binance openInterestHist API request failed: ${response.status}`);
            return null;
        }
        const data: OpenInterestHistItem[] = await response.json();
        return data.length > 0 ? data[0] : null;
    } catch (err) {
        console.error("[OpenInterestCollector] Fetch error:", err);
        return null;
    }
}


/**
 * Collects the latest open interest data point and stores it.
 */
export async function collectOpenInterest() {
    console.log('[OpenInterestCollector] Starting open interest collection...');
    const oi = await fetchLatestOpenInterest();

    if (!oi) {
        console.log('[OpenInterestCollector] Failed to fetch open interest.');
        return;
    }

    if (!isFirebaseConfigured) {
        console.warn('[OpenInterestCollector] Firebase not configured. Skipping Firestore write.');
        return;
    }

    // Use the timestamp as the document ID to avoid duplicates.
    const oiCollection = collection(db, 'open_interest');
    await setDoc(doc(oiCollection, String(oi.timestamp)), {
        ...oi,
        sumOpenInterest: parseFloat(oi.sumOpenInterest),
        sumOpenInterestValue: parseFloat(oi.sumOpenInterestValue),
        collectedAt: serverTimestamp(),
    });

    console.log(`[OpenInterestCollector] Successfully collected open interest for time ${oi.timestamp}.`);
}
