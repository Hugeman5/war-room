
export function normalizeBias(bias: string): 'LONG' | 'SHORT' | 'Neutral' {
  const upper = (bias || '').toUpperCase();
  if (upper === 'BULLISH' || upper === 'LONG') {
    return 'LONG';
  }
  if (upper === 'BEARISH' || upper === 'SHORT') {
    return 'SHORT';
  }
  // Everything else becomes Neutral
  return 'Neutral';
}
