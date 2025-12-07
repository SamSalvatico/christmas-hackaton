import type { AuthenticationConfig } from './auth';

/**
 * External data source configuration
 */
export interface ExternalDataSource {
  id: string;
  name: string;
  endpointUrl: string;
  authentication: AuthenticationConfig;
  dataFormat: string; // JSON, XML, etc.
  refreshFrequency: number; // seconds, 0 for on-demand
  timeout: number; // milliseconds, default: 5000
  retryAttempts: number; // default: 3, max: 5
}

