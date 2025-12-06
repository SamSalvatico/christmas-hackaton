import { loadConfiguration } from '../config/loader';
import { applyAuthentication } from './auth-handler';
import { createUserFriendlyError, isRetryableError, ErrorCode } from '../utils/errors';
import type { ExternalDataSource } from '../types/external-data';

/**
 * Fetch data from an external data source
 */
export async function fetchExternalData(
  sourceId: string,
  endpoint?: string,
  params?: Record<string, string>,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown
): Promise<unknown> {
  const config = loadConfiguration();
  const source = config.externalDataSources.find((s) => s.id === sourceId);

  if (!source) {
    throw new Error(`External data source '${sourceId}' not found`);
  }

  // Build URL
  let url = source.endpointUrl;
  if (endpoint) {
    url = `${url.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  }

  // Add query parameters for GET requests
  if (method === 'GET' && params) {
    const searchParams = new URLSearchParams(params);
    url = `${url}?${searchParams.toString()}`;
  }

  // Prepare headers
  const headers = applyAuthentication(source.authentication, {
    'Content-Type': 'application/json',
  });

  // Prepare request options with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), source.timeout);

  const requestOptions: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  };

  // Add body for POST/PUT requests
  if ((method === 'POST' || method === 'PUT') && body) {
    requestOptions.body = JSON.stringify(body);
  }

  // Retry logic
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= source.retryAttempts; attempt++) {
    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `External API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt or if error is not retryable
      if (attempt === source.retryAttempts || !isRetryableError(error)) {
        break;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  // If we get here, all retries failed
  const friendlyError = createUserFriendlyError(
    lastError,
    `Failed to fetch data from ${source.name}`
  );
  friendlyError.code = ErrorCode.EXTERNAL_SERVICE_ERROR;
  friendlyError.retryable = isRetryableError(lastError);
  throw friendlyError;
}

/**
 * Get external data source by ID
 */
export function getExternalDataSource(sourceId: string): ExternalDataSource | undefined {
  const config = loadConfiguration();
  return config.externalDataSources.find((s) => s.id === sourceId);
}

