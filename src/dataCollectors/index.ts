
/**
 * @file This file serves as the main entry point for the data collection layer.
 * It exports all individual collectors and provides a master function to run all of them.
 */

import { collectTrades } from './tradesCollector';
import { collectOrderbookSnapshot } from './orderbookCollector';
import { collectLiquidations } from './liquidationsCollector';
import { collectFundingRate } from './fundingCollector';
import { collectOpenInterest } from './openInterestCollector';

export {
    collectTrades,
    collectOrderbookSnapshot,
    collectLiquidations,
    collectFundingRate,
    collectOpenInterest,
};

/**
 * Runs all data collectors in sequence.
 * In a production environment, you might run these on different schedules
 * or in parallel, depending on the data source rate limits and collection needs.
 */
export async function runAllCollectors() {
    console.log('--- [DataCollection] Starting master collector run ---');

    await collectTrades();
    await collectOrderbookSnapshot();
    await collectLiquidations();
    await collectFundingRate();
    await collectOpenInterest();

    console.log('--- [DataCollection] Master collector run finished ---');
}
