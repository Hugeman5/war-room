export function shouldTrade(confidence: number): boolean {
  return confidence >= 0.6;
}
