import type { ExternalDataSource } from './external-data';
import type { AIServiceConfig } from './ai-service';

/**
 * Application configuration with default values
 */
export interface ApplicationConfiguration {
  serverPort: number; // default: 3000, range: 1024-65535
  externalDataSources: ExternalDataSource[];
  aiServices: AIServiceConfig[];
  environment: 'development' | 'production' | 'test';
}

