/**
 * Format a bigint price value as INR currency
 * @param price - Price in paise (bigint)
 * @returns Formatted currency string (e.g., "₹1,234.56")
 */
export function formatCurrency(price: bigint): string {
  const rupees = Number(price) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(rupees);
}
