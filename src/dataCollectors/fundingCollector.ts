
import { db } from './database';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

type FundingRateItem = {
    symbol: string;
    fundingTime: number;
    fundingRate: string;
};

async function fetchLatestFundingRate(): Promise<FundingRateItem | null> {
    const url = 'https://fapi.binance.com/fapi/v1/fundingRate?symbol=BTCUSDT&limit=1';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[FundingCollector] Binance fundingRate API request failed with status: ${response.status}`);
            return null;
        }
        const data: FundingRateItem[] = await response.json();
        return data.length > 0 ? data[0] : null;
    } catch (err) {
        console.error("[FundingCollector] Fetch error:", err);
        return null;
    }
}

/**
 * Collects the latest funding rate and stores it.
 * Funding rates are updated every 8 hours typically, so this doesn't need to run too frequently.
 */
export async function collectFundingRate() {
    console.log('[FundingCollector] Starting funding rate collection...');
    const fundingRate = await fetchLatestFundingRate();

    if (!fundingRate) {
        console.log('[FundingCollector] Failed to fetch funding rate.');
        return;
    }

    if (!isFirebaseConfigured) {
        console.warn('[FundingCollector] Firebase not configured. Skipping Firestore write.');
        return;
    }

    const fundingCollection = collection(db, 'funding_rates');
    // Store the funding rate with its fundingTime as the document ID to avoid duplicates.
    await setDoc(doc(fundingCollection, String(fundingRate.fundingTime)), {
        ...fundingRate,
        fundingRate: parseFloat(fundingRate.fundingRate),
        collectedAt: serverTimestamp(),
    });

    console.log(`[FundingCollector] Successfully collected funding rate for time ${fundingRate.fundingTime}: ${fundingRate.fundingRate}`);
}
