/**
 * Fixed USD to INR exchange rate
 * 1 USD = 91.8 INR
 */
const USD_TO_INR_RATE = 91.8;

/**
 * Format a bigint price value (stored as USD cents) as INR currency
 * @param priceInUsdCents - Price in USD cents (bigint)
 * @returns Formatted INR currency string (e.g., "₹9,180")
 */
export function formatCurrency(priceInUsdCents: bigint): string {
  // Convert USD cents to USD dollars
  const usdDollars = Number(priceInUsdCents) / 100;
  
  // Convert USD to INR
  const inrAmount = usdDollars * USD_TO_INR_RATE;
  
  // Format as INR with Indian locale (en-IN)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0, // No decimal places for rupees
  }).format(inrAmount);
}

/**
 * Convert INR rupees (user input) back to USD cents (backend storage)
 * @param inrRupees - Amount in INR rupees
 * @returns Amount in USD cents (bigint)
 */
export function convertInrToUsdCents(inrRupees: number): bigint {
  // Convert INR to USD
  const usdDollars = inrRupees / USD_TO_INR_RATE;
  
  // Convert to cents and return as bigint
  return BigInt(Math.round(usdDollars * 100));
}
