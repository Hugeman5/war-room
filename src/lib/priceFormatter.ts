
export function formatPrice(value: number | null | undefined): string {
  if (value === null || typeof value === 'undefined') return "$0.00";

  // Safety check for suspiciously low values for BTC
  if (value > 0 && value < 1000) {
    // console.warn("Suspicious BTC price detected:", value);
  }

  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
