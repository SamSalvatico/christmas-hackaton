import type { RateLimitConfig } from '../types/rate-limit';

interface RateLimitState {
  requests: number[];
  lastReset: number;
}

const rateLimitStore = new Map<string, RateLimitState>();

/**
 * Check if a request is within rate limits
 */
export function checkRateLimit(
  serviceId: string,
  config: RateLimitConfig
): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const state = rateLimitStore.get(serviceId) || {
    requests: [],
    lastReset: now,
  };

  // Clean old requests (older than 24 hours)
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  state.requests = state.requests.filter((time) => time > oneDayAgo);

  // Check per-minute limit
  const oneMinuteAgo = now - 60 * 1000;
  const requestsLastMinute = state.requests.filter(
    (time) => time > oneMinuteAgo
  ).length;

  if (requestsLastMinute >= config.requestsPerMinute) {
    const oldestRequest = Math.min(...state.requests.filter((time) => time > oneMinuteAgo));
    return {
      allowed: false,
      resetTime: oldestRequest + 60 * 1000,
    };
  }

  // Check per-hour limit
  const oneHourAgo = now - 60 * 60 * 1000;
  const requestsLastHour = state.requests.filter(
    (time) => time > oneHourAgo
  ).length;

  if (requestsLastHour >= config.requestsPerHour) {
    const oldestRequest = Math.min(...state.requests.filter((time) => time > oneHourAgo));
    return {
      allowed: false,
      resetTime: oldestRequest + 60 * 60 * 1000,
    };
  }

  // Check per-day limit
  if (state.requests.length >= config.requestsPerDay) {
    const oldestRequest = Math.min(...state.requests);
    return {
      allowed: false,
      resetTime: oldestRequest + 24 * 60 * 60 * 1000,
    };
  }

  // All checks passed - record this request
  state.requests.push(now);
  rateLimitStore.set(serviceId, state);

  return { allowed: true };
}

/**
 * Reset rate limit for a service (for testing)
 */
export function resetRateLimit(serviceId: string): void {
  rateLimitStore.delete(serviceId);
}

