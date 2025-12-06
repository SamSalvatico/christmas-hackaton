/**
 * In-memory cache utility with TTL (Time-To-Live) support
 *
 * This cache stores data in memory with expiration timestamps.
 * Cache entries automatically expire after their TTL period.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number; // milliseconds since epoch
  ttl: number; // milliseconds
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Get a value from the cache if it exists and is not expired
   * @param key Cache key
   * @returns Cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    const now = Date.now();
    const age = now - entry.timestamp;
    if (age > entry.ttl) {
      // Entry expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set a value in the cache with a TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time-to-live in milliseconds
   */
  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Remove a value from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns true if key exists and is valid, false otherwise
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if entry is expired
    const now = Date.now();
    const age = now - entry.timestamp;
    if (age > entry.ttl) {
      // Entry expired, remove it
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const cache = new InMemoryCache();

// Export class for testing purposes
export { InMemoryCache };

