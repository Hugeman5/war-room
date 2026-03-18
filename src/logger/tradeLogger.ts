import fs from 'fs';

export function logDecision(data: any) {
  const line = JSON.stringify({
    ...data,
    timestamp: Date.now(),
  }) + "\n";

  fs.appendFileSync('logs/trades.log', line);
}
