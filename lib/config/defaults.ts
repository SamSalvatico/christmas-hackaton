import type { ApplicationConfiguration } from '../types/config';

/**
 * Default configuration values
 * These allow the application to run without user modification
 */
export const defaultConfig: ApplicationConfiguration = {
  serverPort: 3000,
  environment: 'development',
  externalDataSources: [
    {
      id: 'sample-api',
      name: 'Sample API',
      endpointUrl: 'https://jsonplaceholder.typicode.com',
      authentication: {
        method: 'none',
        apiKey: null,
        bearerToken: null,
        username: null,
        password: null,
        headerName: null,
      },
      dataFormat: 'JSON',
      refreshFrequency: 0, // on-demand
      timeout: 5000,
      retryAttempts: 3,
    },
  ],
  aiServices: [
    {
      id: 'demo-ai',
      provider: 'demo',
      endpointUrl: 'https://api.example.com/ai',
      authentication: {
        method: 'none',
        apiKey: null,
        bearerToken: null,
        username: null,
        password: null,
        headerName: null,
      },
      model: 'demo-model',
      maxTokens: 1000,
      temperature: 0.7,
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      },
      timeout: 30000,
    },
  ],
};

