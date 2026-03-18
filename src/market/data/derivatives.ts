
export type OpenInterestHistItem = {
    sumOpenInterest: string;
    sumOpenInterestValue: string;
    timestamp: number;
};

export type LiquidationOrder = {
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

export type FundingRateItem = {
    symbol: string;
    fundingTime: number;
    fundingRate: string;
};


/**
 * Fetches recent open interest history for BTCUSDT.
 */
export async function fetchOpenInterestHistory(): Promise<number[]> {
    // The API returns data newest-to-oldest, so we must sort it chronologically.
    const url = 'https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=5m&limit=100';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Binance openInterestHist API request failed with status: ${response.status} for URL: ${url}`);
            return [];
        }
        const data: OpenInterestHistItem[] = await response.json();
        const sortedData = data.sort((a,b) => a.timestamp - b.timestamp);
        return sortedData.map(item => Number(item.sumOpenInterest));
    } catch (err) {
        console.error("Open interest history fetch error:", err);
        return [];
    }
}

/**
 * Fetches and processes recent liquidation orders for BTCUSDT.
 */
export async function fetchLiquidations(): Promise<{value: number, side: 'long' | 'short'}[]> {
    const symbol = "BTCUSDT";
    const url = `https://fapi.binance.com/fapi/v1/allForceOrders?symbol=${symbol}&limit=50`;
     try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn("Liquidation API error:", response.status);
            return [];
        }
        const data: LiquidationOrder[] = await response.json();
        const mappedData: {value: number, side: 'long' | 'short'}[] = data.map(l => ({
            value: (Number(l.origQty) * Number(l.averagePrice)) || 0,
            // A SELL liquidation is a forced close of a LONG position.
            // A BUY liquidation is a forced close of a SHORT position.
            side: l.side === 'SELL' ? 'long' : 'short',
        }));
        return mappedData;
    } catch (err) {
        console.error("Liquidation orders fetch error:", err);
        return [];
    }
}

/**
 * Fetches recent funding rate history for BTCUSDT.
 */
export async function fetchFundingRateHistory(): Promise<number[]> {
    const url = 'https://fapi.binance.com/fapi/v1/fundingRate?symbol=BTCUSDT&limit=50';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Binance fundingRate API request failed with status: ${response.status}`);
            return [];
        }
        const data: FundingRateItem[] = await response.json();
        const sortedData = data.sort((a,b) => a.fundingTime - b.fundingTime);
        return sortedData.map(item => Number(item.fundingRate));
    } catch (err) {
        console.error("Funding rate history fetch error:", err);
        return [];
    }
}
