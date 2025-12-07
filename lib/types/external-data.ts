/**
 * Type definitions for External Data feature
 */

import type { AuthenticationConfig } from './auth';

/**
 * External data source configuration
 */
export interface ExternalDataSource {
  /** Unique identifier for the data source */
  id: string;
  /** Name of the data source */
  name: string;
  /** Base URL for the data source API */
  endpointUrl: string;
  /** Authentication configuration */
  authentication?: AuthenticationConfig;
  /** Data format expected from the source */
  dataFormat?: 'JSON' | 'XML' | 'CSV';
  /** Refresh frequency in milliseconds (0 = on-demand) */
  refreshFrequency?: number;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Number of retry attempts */
  retryAttempts: number;
}

