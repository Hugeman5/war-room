import WebSocket from 'ws';

type TickData = {
  price: number;
  volume: number;
};

export class BinanceWS {
  private ws: WebSocket | null = null;

  connect(onData: (data: TickData) => void) {
    const url = "wss://stream.binance.com:9443/ws/btcusdt@trade";

    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      console.log("🟢 Binance WS Connected");
    });

    this.ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());

        const tick: TickData = {
          price: parseFloat(data.p),
          volume: parseFloat(data.q),
        };

        onData(tick);

      } catch (err) {
        console.error("WS parse error:", err);
      }
    });

    this.ws.on('close', () => {
      console.log("🔴 WS Disconnected — reconnecting...");
      setTimeout(() => this.connect(onData), 2000);
    });

    this.ws.on('error', (err) => {
      console.error("WS error:", err);
      this.ws?.close();
    });
  }
}
