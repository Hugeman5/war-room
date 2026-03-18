const bullishWords = [
  "surge", "rally", "bull", "breakout", "gain", "pump"
];

const bearishWords = [
  "crash", "drop", "bear", "selloff", "loss", "dump"
];

export function scoreNewsSentiment(headlines: string[]): number {
  let score = 0;

  for (const h of headlines) {
    const lower = h.toLowerCase();

    bullishWords.forEach(w => {
      if (lower.includes(w)) score += 1;
    });

    bearishWords.forEach(w => {
      if (lower.includes(w)) score -= 1;
    });
  }

  return Math.max(-1, Math.min(1, score / 10));
}