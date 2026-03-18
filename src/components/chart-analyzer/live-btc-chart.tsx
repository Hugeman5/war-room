
'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  type SeriesMarker,
  type IPriceLine,
} from 'lightweight-charts';
import { useMarketDataStore } from '@/store/marketDataStore';
import { useMarketEventStore, type MarketEvent } from '@/store/marketEventStore';
import { marketDataBus } from '@/market/marketDataBus';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import type { Timeframe } from '@/lib/candle-builder';

const chartOptions = {
    layout: {
        background: { color: 'transparent' },
        textColor: '#9aa4ad',
    },
    grid: {
        vertLines: { color: '#2b323b' },
        horzLines: { color: '#2b323b' },
    },
    timeScale: {
        borderColor: '#2b323b',
        timeVisible: true,
        secondsVisible: true,
    },
    rightPriceScale: {
        borderColor: '#2b323b',
        autoScale: true,
    },
    crosshair: {
        mode: 1, // Magnet
    },
};

const seriesOptions = {
    upColor: '#00ffcc',
    downColor: '#ff3d3d',
    borderVisible: false,
    wickDownColor: '#ff3d3d',
    wickUpColor: '#00ffcc',
};

function eventToMarker(event: MarketEvent): SeriesMarker<Time> | null {
    if (!event.priceLevel) return null;
    
    const time = Number(event.time) as Time;

    switch (event.type) {
        case 'LIQUIDITY_SWEEP':
            return {
                time,
                shape: event.details?.direction === 'buy-side' ? 'arrowDown' : 'arrowUp',
                position: event.details?.direction === 'buy-side' ? 'aboveBar' : 'belowBar',
                color: '#ffb020', // primary (gold)
                text: 'LIQ. SWEEP',
            };
        case 'SMART_MONEY':
             return {
                time,
                color: event.details?.direction === 'bullish' ? '#00ffcc' : '#ff3d3d',
                text: event.details?.activity.slice(0, 4).toUpperCase(),
                shape: 'circle',
                position: event.details?.direction === 'bullish' ? 'belowBar' : 'aboveBar',
            };
        case 'WHALE':
            return {
                time,
                color: event.details?.direction === 'exchange_outflow' ? '#00ffcc' : '#ff3d3d',
                text: 'WHALE',
                shape: event.details?.direction === 'exchange_outflow' ? 'arrowUp' : 'arrowDown',
                position: event.details?.direction === 'exchange_outflow' ? 'belowBar' : 'aboveBar',
            };
        default:
            return null; // Don't create markers for other event types
    }
}


export default function LiveBTCChart({ activeTimeframe }: { activeTimeframe: Timeframe }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candles = useMarketDataStore(state => state[`candles${activeTimeframe}`]);
  const { events: marketEvents } = useMarketEventStore();
  const { strategy, liquidationHeatmap, orderBlocks, marketStructure } = useIntelligenceStore();

  const [chart, setChart] = useState<IChartApi | null>(null);
  const [series, setSeries] = useState<ISeriesApi<'Candlestick'> | null>(null);
  
  const structureLines = useRef<IPriceLine[]>([]);
  const liquidationLines = useRef<IPriceLine[]>([]);
  const orderBlockLines = useRef<IPriceLine[]>([]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartInstance = createChart(chartContainerRef.current, { ...chartOptions, autoSize: true });
    const candleSeries = chartInstance.addCandlestickSeries(seriesOptions);
    
    setChart(chartInstance);
    setSeries(candleSeries);
    
    const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
                 chartInstance.resize(width, height);
            }
        }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      if (chartContainerRef.current) {
        resizeObserver.unobserve(chartContainerRef.current);
      }
      chartInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (!series || !chart || !candles) return;

    const formattedData: CandlestickData<Time>[] = candles.map(c => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
    }));
    series.setData(formattedData);
    chart.timeScale().fitContent();

    const unsubscribe = marketDataBus.subscribe(({ timeframe, candle }) => {
        if (timeframe === activeTimeframe) {
            series.update({
                time: candle.time as Time, open: candle.open, high: candle.high, low: candle.low, close: candle.close,
            });
        }
    });

    return () => unsubscribe();
  }, [activeTimeframe, candles, series, chart]);

  useEffect(() => {
    if (!series) return;
    
    const eventMarkers = marketEvents.map(eventToMarker).filter((m): m is SeriesMarker<Time> => m !== null);
    
    const strategyMarkers: SeriesMarker<Time>[] = [];
    const lastCandle = candles && candles.length > 0 ? candles[candles.length - 1] : null;

    if (strategy && strategy.bias !== 'Neutral' && lastCandle) {
        const isLong = strategy.bias === 'LONG';
        const signalMarker: SeriesMarker<Time> = {
            time: Number(lastCandle.time) as Time,
            position: isLong ? 'belowBar' : 'aboveBar',
            color: isLong ? '#00ffcc' : '#ff3d3d',
            shape: isLong ? 'arrowUp' : 'arrowDown',
            text: isLong ? 'LONG' : 'SHORT',
        };
        strategyMarkers.push(signalMarker);
    }
    
    const structureMarkers: SeriesMarker<Time>[] = [];
    if (marketStructure) {
        marketStructure.swingPoints.slice(-10).forEach(sp => {
            structureMarkers.push({
                time: Number(sp.time) as Time,
                position: sp.type === 'high' ? 'aboveBar' : 'belowBar',
                color: sp.type === 'high' ? '#ff3d3d' : '#00ffcc',
                shape: 'circle',
            });
        });
    }

    const allMarkers = [
      ...eventMarkers,
      ...strategyMarkers,
      ...structureMarkers
    ];

    // Filter out any markers that are malformed or have an invalid time.
    const validMarkers = allMarkers.filter(marker => 
        marker && 
        marker.time && 
        !isNaN(Number(marker.time))
    );

    const sortedMarkers = validMarkers.sort((a, b) => Number(a.time) - Number(b.time));

    series.setMarkers(sortedMarkers);

  }, [marketEvents, strategy, candles, series, marketStructure]);

  useEffect(() => {
      if (!series) return;
      
      structureLines.current.forEach(line => series.removePriceLine(line));
      structureLines.current = [];

      if (!marketStructure || !marketStructure.events) return;

      const createLine = (price: number, color: string, label: string) => {
          const line = series.createPriceLine({
              price,
              color,
              lineWidth: 1,
              lineStyle: 1, // Dotted
              axisLabelVisible: true,
              title: label,
          });
          structureLines.current.push(line);
      }

      const lastEvent = marketStructure.events.slice(-1)[0];
      if (lastEvent) {
          const isBullish = lastEvent.direction === 'bullish';
          const color = isBullish ? '#00ffcc' : '#ff3d3d';
          createLine(lastEvent.price, color, lastEvent.type);
      }
  }, [marketStructure, series]);

  useEffect(() => {
    if (!series) return;

    liquidationLines.current.forEach(line => series.removePriceLine(line));
    liquidationLines.current = [];

    if (!liquidationHeatmap) return;

    const createLine = (price: number, color: string, label: string) => {
        const line = series.createPriceLine({
            price,
            color,
            lineWidth: 1,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: label.toUpperCase(),
        });
        liquidationLines.current.push(line);
    }
    
    // Short liquidations (above price) are colored RED
    liquidationHeatmap.shortLiquidations
      .sort((a,b) => b.size - a.size)
      .slice(0, 3)
      .forEach(liq => {
        createLine(liq.price, '#ff3d3d', 'SHORT LIQ');
    });
    
    // Long liquidations (below price) are colored GREEN
    liquidationHeatmap.longLiquidations
      .sort((a,b) => b.size - a.size)
      .slice(0, 3)
      .forEach(liq => {
        createLine(liq.price, '#00ffcc', 'LONG LIQ');
    });

  }, [liquidationHeatmap, series]);

  useEffect(() => {
    if (!series) return;

    orderBlockLines.current.forEach(line => series.removePriceLine(line));
    orderBlockLines.current = [];

    if (!orderBlocks) return;
    
    const createBlockZone = (block: { priceRange: [number, number] }, color: string, title: string) => {
        const [low, high] = block.priceRange;
        const top_line = series.createPriceLine({
            price: high,
            color: color,
            lineWidth: 1,
            lineStyle: 3, // Large Dotted
            axisLabelVisible: true,
            title: `${title} High`,
        });
        const bottom_line = series.createPriceLine({
            price: low,
            color: color,
            lineWidth: 1,
            lineStyle: 3, // Large Dotted
            axisLabelVisible: true,
            title: `${title} Low`,
        });
        orderBlockLines.current.push(top_line, bottom_line);
    }
    
    // Get most recent active bullish OB
    const activeBullishOb = orderBlocks.bullish
      .filter(b => b.status === 'active')
      .sort((a,b) => b.time - a.time)[0];
    
    if (activeBullishOb) {
        createBlockZone(activeBullishOb, '#00ffcc', 'DEMAND'); // green
    }

    // Get most recent active bearish OB
    const activeBearishOb = orderBlocks.bearish
      .filter(b => b.status === 'active')
      .sort((a,b) => b.time - a.time)[0];

    if (activeBearishOb) {
        createBlockZone(activeBearishOb, '#ff3d3d', 'SUPPLY'); // red
    }

  }, [orderBlocks, series]);

  return <div ref={chartContainerRef} className="h-full w-full min-h-[450px]" />;
}
