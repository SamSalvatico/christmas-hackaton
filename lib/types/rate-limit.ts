/**
 * Rate limiting configuration for AI services
 */
export interface RateLimitConfig {
  requestsPerMinute: number; // Default: 60
  requestsPerHour: number; // Default: 1000
  requestsPerDay: number; // Default: 10000
}

