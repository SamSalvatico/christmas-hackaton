import type { AuthenticationConfig } from '../types/auth';

/**
 * Convert HeadersInit to Record<string, string>
 */
function headersToRecord(headers: HeadersInit): Record<string, string> {
  if (headers instanceof Headers) {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...headers };
}

/**
 * Apply authentication to a request based on configuration
 */
export function applyAuthentication(
  config: AuthenticationConfig,
  headers: HeadersInit = {}
): HeadersInit {
  const authHeaders: Record<string, string> = headersToRecord(headers);

  switch (config.method) {
    case 'apiKey':
      if (config.apiKey) {
        const headerName = config.headerName || 'X-API-Key';
        authHeaders[headerName] = config.apiKey;
      }
      break;

    case 'bearer':
      if (config.bearerToken) {
        authHeaders['Authorization'] = `Bearer ${config.bearerToken}`;
      }
      break;

    case 'basic':
      if (config.username && config.password) {
        const credentials = Buffer.from(
          `${config.username}:${config.password}`
        ).toString('base64');
        authHeaders['Authorization'] = `Basic ${credentials}`;
      }
      break;

    case 'none':
    default:
      // No authentication needed
      break;
  }

  return authHeaders;
}

