/**
 * Error codes for API responses
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Standard error structure for API responses
 */
export interface ApiError {
  message: string;
  code?: ErrorCode;
  retryable: boolean;
}

/**
 * Create a user-friendly error message
 */
export function createUserFriendlyError(
  error: unknown,
  defaultMessage: string
): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message || defaultMessage,
      code: ErrorCode.INTERNAL_ERROR,
      retryable: false,
    };
  }

  return {
    message: defaultMessage,
    code: ErrorCode.INTERNAL_ERROR,
    retryable: false,
  };
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Network errors, timeouts, and 5xx errors are typically retryable
    return (
      error.message.includes('timeout') ||
      error.message.includes('network') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND')
    );
  }
  return false;
}

