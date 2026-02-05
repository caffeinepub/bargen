/**
 * Formats a phone number for WhatsApp deep linking (wa.me)
 * Removes all non-digit characters and ensures proper format
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Return wa.me link
  return `https://wa.me/${digits}`;
}

/**
 * Formats a phone number for tel: protocol
 * Removes all non-digit and non-plus characters
 */
export function formatPhoneForTel(phone: string): string {
  // Keep only digits and plus sign
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Return tel: link
  return `tel:${cleaned}`;
}
