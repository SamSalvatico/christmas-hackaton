import type { AuthenticationConfig } from './auth';
import type { RateLimitConfig } from './rate-limit';

/**
 * AI service configuration
 */
export interface AIServiceConfig {
  id: string;
  provider: string; // e.g., "openai", "anthropic"
  endpointUrl: string;
  authentication: AuthenticationConfig;
  model: string; // e.g., "gpt-4", "claude-3"
  maxTokens: number; // default: 1000, max: 100000
  temperature: number; // 0-2, default: 0.7
  rateLimit: RateLimitConfig;
  timeout: number; // milliseconds, default: 30000
}

