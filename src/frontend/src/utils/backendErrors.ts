/**
 * Normalize backend/agent/react-query errors into clear English messages
 */
export function normalizeBackendError(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check for authentication/authorization errors
  if (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Only users') ||
    errorMessage.includes('Only authenticated') ||
    errorMessage.includes('sign in') ||
    errorMessage.includes('login')
  ) {
    return 'Please log in to perform this action';
  }

  // Check for permission errors
  if (
    errorMessage.includes('permission') ||
    errorMessage.includes('access denied') ||
    errorMessage.includes('forbidden')
  ) {
    return 'You do not have permission to perform this action';
  }

  // Check for not found errors
  if (
    errorMessage.includes('not found') ||
    errorMessage.includes('does not exist') ||
    errorMessage.includes('not available')
  ) {
    return 'The requested item could not be found';
  }

  // Check for validation errors
  if (
    errorMessage.includes('invalid') ||
    errorMessage.includes('must be') ||
    errorMessage.includes('required')
  ) {
    return errorMessage; // Return the specific validation message
  }

  // Check for actor/connection errors
  if (
    errorMessage.includes('Actor not available') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('network')
  ) {
    return 'Unable to connect to the service. Please try again';
  }

  // Return the original message if it's user-friendly, otherwise generic
  if (errorMessage.length < 100 && !errorMessage.includes('Error:')) {
    return errorMessage;
  }

  return 'An error occurred. Please try again';
}

/**
 * Check if an error indicates the user needs to log in
 */
export function isAuthenticationError(error: unknown): boolean {
  if (!error) return false;
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Only users') ||
    errorMessage.includes('Only authenticated') ||
    errorMessage.includes('sign in') ||
    errorMessage.includes('login')
  );
}
