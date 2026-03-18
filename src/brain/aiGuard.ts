let lastCall = 0;

export function canCallAI(): boolean {
  const now = Date.now();

  if (now - lastCall < 10000) return false;

  lastCall = now;
  return true;
}
