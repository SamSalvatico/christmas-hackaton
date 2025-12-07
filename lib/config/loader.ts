import { defaultConfig } from './defaults';
import type { ApplicationConfiguration } from '../types/config';

/**
 * Load application configuration from environment variables or use defaults
 */
export function loadConfiguration(): ApplicationConfiguration {
  const config: ApplicationConfiguration = {
    ...defaultConfig,
    serverPort: parseInt(process.env.PORT || String(defaultConfig.serverPort), 10),
    environment: (process.env.NODE_ENV as ApplicationConfiguration['environment']) || 'development',
  };

  // Validate server port
  if (config.serverPort < 1024 || config.serverPort > 65535) {
    console.warn(
      `Invalid server port ${config.serverPort}, using default 3000`
    );
    config.serverPort = 3000;
  }

  // Ensure at least one external data source
  if (config.externalDataSources.length === 0) {
    console.warn('No external data sources configured, using defaults');
  }

  // Ensure at least one AI service
  if (config.aiServices.length === 0) {
    console.warn('No AI services configured, using defaults');
  }

  return config;
}

