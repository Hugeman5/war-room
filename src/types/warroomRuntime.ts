import type { MarketDataBus } from '@/market/marketDataBus';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';

export interface WarRoomRuntime {
  // HMR persistence for development
  marketDataBus?: MarketDataBus;
  chartInstance?: IChartApi;
  candleSeries?: ISeriesApi<'Candlestick'>;

  // Runtime diagnostics
  startTime?: number;
  marketFeedStatus?: 'ONLINE' | 'OFFLINE';
  engineStatus?: Record<string, 'ACTIVE' | 'FAILED' | 'IDLE'>;
  lastCandleTime?: number;
  lastPrice?: number;
}
