import WebSocket from 'ws';

type TickData = {
  price: number;
  volume: number;
  isBuyerMaker: boolean;
};

export class BinanceWS {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;

  connect(onData: (data: TickData) => void) {
    const url = "wss://stream.binance.com:9443/ws/btcusdt@trade";

    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      console.log("🟢 Binance WS Connected");
      this.reconnectAttempts = 0;
    });

    this.ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        
        const price = parseFloat(data.p);
        const volume = parseFloat(data.q);
        const isBuyerMaker = data.m;

        if (isNaN(price) || isNaN(volume)) return; 

        const tick: TickData = {
          price,
          volume,
          isBuyerMaker,
        };

        onData(tick);

      } catch (err) {
      }
    });

    this.ws.on('close', () => {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`🔴 WS Disconnected — reconnecting in ${delay}ms...`);
      this.reconnectAttempts++;
      setTimeout(() => this.connect(onData), delay);
    });

    this.ws.on('error', (err) => {
      this.ws?.close();
    });
  }
}
