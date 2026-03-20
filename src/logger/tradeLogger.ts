import fs from 'fs';
import path from 'path';

export function logDecision(data: any) {
  try {
    const logDir = 'logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const line = JSON.stringify({
      ...data,
      timestamp: Date.now(),
    }) + "\n";

    fs.appendFileSync(path.join(logDir, 'trades.log'), line);
  } catch (err) {
    console.error("TradeLogger failed, ignoring to prevent crash:", err);
  }
}
