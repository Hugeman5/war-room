
let socket: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
const RECONNECT_DELAY = 2000; // 2 seconds
const BINANCE_WS = 'wss://stream.binance.com:9443/ws/btcusdt@trade';

type SocketStatusCallback = (isConnected: boolean) => void;
type TradeCallback = (trade: any) => void;

let statusCallback: SocketStatusCallback | null = null;
let tradeCallback: TradeCallback | null = null;

function connect() {
  // If socket exists and is open or connecting, do nothing.
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  console.log('Connecting to Binance stream...');
  socket = new WebSocket(BINANCE_WS);

  socket.onopen = () => {
    console.log('Binance WebSocket connected');
    if (statusCallback) statusCallback(true);
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (tradeCallback) tradeCallback(data);
    } catch (err) {
      console.error('Trade parsing error:', err);
    }
  };

  socket.onerror = (err) => {
    console.error('Binance socket error:', err);
    socket?.close();
  };

  socket.onclose = () => {
    console.warn('Binance WebSocket closed');
    if (statusCallback) statusCallback(false);
    socket = null;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    // Automatically attempt to reconnect.
    reconnectTimer = setTimeout(() => {
      connect();
    }, RECONNECT_DELAY);
  };
}

export function initializeMarketSocket(
  onStatusChange: SocketStatusCallback,
  onNewTrade: TradeCallback,
) {
    statusCallback = onStatusChange;
    tradeCallback = onNewTrade;
    connect();
}

export function disconnectMarketSocket() {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
    if (socket) {
        // Remove onclose listener to prevent auto-reconnection attempts.
        socket.onclose = () => {
          if (statusCallback) statusCallback(false);
          socket = null;
          console.log('Binance WebSocket permanently closed.');
        };
        socket.close();
    }
}
