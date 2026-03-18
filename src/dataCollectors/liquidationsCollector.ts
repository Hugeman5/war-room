
import { db } from './database';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

type LiquidationOrder = {
    symbol: string;
    price: string;
    origQty: string;
    executedQty: string;
    averagePrice: string;
    status: string;
    timeInForce: string;
    type: 'LIMIT' | 'MARKET';
    side: 'SELL' | 'BUY';
    time: number;
};

async function fetchLiquidationOrders(): Promise<LiquidationOrder[]> {
    const url = `https://fapi.binance.com/fapi/v1/allForceOrders?symbol=BTCUSDT&limit=100`;
     try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[LiquidationsCollector] Binance liquidations API error: ${response.status}`);
            return [];
        }
        return await response.json();
    } catch (err) {
        console.error("[LiquidationsCollector] Fetch error:", err);
        return [];
    }
}

/**
 * Collects recent liquidation orders.
 * Note: Binance API only provides recent liquidations. To build a history,
 * this collector needs to run frequently and de-duplicate results.
 */
export async function collectLiquidations() {
    console.log('[LiquidationsCollector] Starting liquidation order collection...');
    const liquidations = await fetchLiquidationOrders();

    if (liquidations.length === 0) {
        console.log('[LiquidationsCollector] No new liquidations found.');
        return;
    }

    if (!isFirebaseConfigured) {
        console.warn('[LiquidationsCollector] Firebase not configured. Skipping Firestore write.');
        return;
    }

    // In a real implementation, you would check if these liquidations are already
    // in the database before writing to avoid duplicates.
    const liquidationsCollection = collection(db, 'liquidations');
    const promises = liquidations.map(liq => {
        const docData = {
            ...liq,
            price: parseFloat(liq.price),
            origQty: parseFloat(liq.origQty),
            executedQty: parseFloat(liq.executedQty),
            averagePrice: parseFloat(liq.averagePrice),
            time: Timestamp.fromMillis(liq.time),
            collectedAt: Timestamp.now()
        };
        return addDoc(liquidationsCollection, docData);
    });
    
    await Promise.all(promises);

    console.log(`[LiquidationsCollector] Successfully collected and stored ${liquidations.length} liquidations.`);
}
