/**
 * Generates a canonical, shareable live URL from the current location.
 * Strips any draft/preview-only query/hash parameters while preserving the current route.
 */
export function getLiveShareUrl(): string {
  const { protocol, host, pathname } = window.location;
  
  // Build the base URL without any query parameters or hash fragments
  // that might be specific to draft/preview modes
  const liveUrl = `${protocol}//${host}${pathname}`;
  
  return liveUrl;
}
