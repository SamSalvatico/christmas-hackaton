import type { ApiError } from './errors';

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    timestamp: number;
    [key: string]: unknown;
  };
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  metadata?: Record<string, unknown>
): ApiResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: Date.now(),
      ...metadata,
    },
  };
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  error: ApiError,
  metadata?: Record<string, unknown>
): ApiResponse {
  return {
    success: false,
    error,
    metadata: {
      timestamp: Date.now(),
      ...metadata,
    },
  };
}

