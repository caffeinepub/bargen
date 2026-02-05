/**
 * Format a bigint price value as USD currency
 * @param price - Price in cents (bigint)
 * @returns Formatted currency string (e.g., "$12.34")
 */
export function formatCurrency(price: bigint): string {
  const dollars = Number(price) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}
