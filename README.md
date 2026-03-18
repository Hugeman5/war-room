# Stellenbosch Mafia War Room
### Strategic Trading Intelligence Platform

## PROJECT DESCRIPTION

The Stellenbosch Mafia War Room is a real-time market intelligence terminal designed for analyzing cryptocurrency markets and generating AI-assisted trading insights.

The platform streams live Bitcoin market data, builds real-time candlestick charts, and runs multiple intelligence engines that analyze market structure, volatility, and trading opportunities.

The system is designed to function as an AI-powered trading command center.

## CORE FEATURES

### Real-Time Market Feed

The platform connects directly to the Binance WebSocket API and streams live Bitcoin market data.

### Candlestick Chart Engine

Incoming trade data is aggregated into real-time candles across multiple timeframes.

Supported timeframes:

* 1m
* 5m
* 15m
* 1h

The chart updates continuously with minimal latency.

### Live Intelligence Dashboard

The War Room dashboard displays multiple intelligence panels including:

* Live BTC price
* Session intelligence
* Market structure analysis
* Strategy engine outputs
* Tactical trade planning

### Market Structure Engine

Analyzes candles to detect:

* Higher highs
* Higher lows
* Lower highs
* Lower lows
* Break of structure
* Change of character
* Trend classification

Structure markers are displayed on the chart and summarized in the intelligence panel.

### Strategy Engine

Combines signals from intelligence engines to generate tactical trade insights.

## SYSTEM ARCHITECTURE

### Market Data Layer

The system is designed to integrate multiple real-time and API-based data sources.

#### Market Microstructure
*   **Source:** Binance (WebSocket & REST API)
*   **Data:** Live Trades, Order Book Depth, Liquidations, Funding Rates, Open Interest.

#### On-Chain & Whale Intelligence
*   **Source (Production):** Whale Alert, Arkham Intelligence, Glassnode APIs (Simulated in this prototype).
*   **Data:** Large wallet movements, exchange inflows/outflows.

#### Derivatives Intelligence
*   **Source (Production):** Coinalyze, CryptoQuant APIs (Proxied via Binance API in this prototype).
*   **Data:** Long/short ratios, aggregated funding rates, liquidation clusters.

#### Macroeconomic Data
*   **Source (Production):** Economic Calendars, Federal Reserve (FRED) API (Simulated in this prototype).
*   **Data:** ETF Inflows, Dollar Index (DXY), US Treasury Yields.

### Data Processing Layer

* Candle Builder Engine
* Real-time candle aggregation
* Multi-timeframe support

### Analysis Layer

* Market Structure Engine
* Pattern analysis modules
* Strategy Engine

### Presentation Layer

* War Room Dashboard
* Live chart visualization
* Intelligence panels

## PROJECT STRUCTURE
```
/market
  marketDataService.js
  candleBuilder.js

/chart
  chartEngine.js

/engines
  MarketStructureEngine.js

/components
  LiveBTCChart.jsx
  WarRoomDashboard.jsx
```

## FUTURE MODULES

The architecture is designed to support additional intelligence engines:

* Liquidity Engine
* Order Flow Engine
* Risk Engine
* News Sentiment Engine
* AI Decision Layer

These modules will subscribe to candle and structure events via the system event bus.

## EVENT SYSTEM

The platform exposes internal events that engines can subscribe to:

* onCandleUpdate
* onNewCandle
* structure:BOS
* structure:CHOCH
* structure:trendChange

These events enable modular intelligence engines to run independently.

## OBJECTIVE

The long-term objective of the War Room platform is to provide an AI-driven trading intelligence system capable of:

* Analyzing live market data
* Detecting structural market shifts
* Evaluating risk and volatility
* Generating high-confidence trade setups

## DISCLAIMER

This platform is a research and intelligence tool and does not execute trades automatically.

Users remain responsible for their trading decisions.
