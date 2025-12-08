/**
 * Countries service for fetching, caching, and validating country names
 */

import { cache } from '@/lib/utils/cache';
import type {
  CountriesList,
  RestCountriesResponse,
  ValidationResult,
} from '@/lib/types/countries';

/**
 * REST Countries API endpoint
 */
const REST_COUNTRIES_URL =
  'https://restcountries.com/v3.1/all?fields=name';

/**
 * Cache key for countries list
 */
export const COUNTRIES_CACHE_KEY = 'countries';

/**
 * Cache TTL: 10 minutes in milliseconds
 */
const CACHE_TTL = 10 * 60 * 1000; // 600,000 milliseconds

/**
 * Request timeout: 10 seconds
 */
const REQUEST_TIMEOUT = 10 * 1000; // 10,000 milliseconds

/**
 * Normalized lookup cache (internal)
 * Maps normalized (lowercase) country names to original country names
 */
let normalizedLookup: Set<string> | null = null;
let originalCountries: CountriesList | null = null;

/**
 * Create normalized lookup set from countries list
 * @param countries - Array of country names
 * @returns Set of normalized (lowercase) country names
 */
function createNormalizedLookup(countries: CountriesList): Set<string> {
  return new Set(countries.map((country) => country.toLowerCase()));
}

/**
 * Fetch countries from REST Countries API
 * @returns Array of country names (name.common)
 * @throws Error if fetch fails or times out
 */
async function fetchCountriesFromAPI(): Promise<CountriesList> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(REST_COUNTRIES_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `REST Countries API returned ${response.status}: ${response.statusText}`
      );
    }

    const data: RestCountriesResponse = await response.json();

    // Extract name.common from each country object
    const countries: CountriesList = data
      .map((item) => item.name.common)
      .filter((name) => name && name.trim().length > 0)
      .sort(); // Sort alphabetically for better UX

    return countries;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    throw error;
  }
}

/**
 * Get countries list from cache or API
 * Uses cache when available, fetches from API on cache miss
 * @returns Promise resolving to array of country names
 * @throws Error if countries list cannot be fetched and no cache is available
 */
export async function getCountriesList(): Promise<CountriesList> {
  // Check cache first
  const cachedCountries = cache.get<CountriesList>(COUNTRIES_CACHE_KEY);

  if (cachedCountries) {
    // Cache hit - return cached data
    return cachedCountries;
  }

  // Cache miss - fetch from REST Countries API
  try {
    const countries = await fetchCountriesFromAPI();

    // Store in cache with TTL
    cache.set(COUNTRIES_CACHE_KEY, countries, CACHE_TTL);

    // Update normalized lookup
    normalizedLookup = createNormalizedLookup(countries);
    originalCountries = countries;

    return countries;
  } catch (apiError) {
    // API fetch failed - check if we have expired cache as fallback
    const expiredCache = cache.get<CountriesList>(COUNTRIES_CACHE_KEY);

    if (expiredCache) {
      // Return expired cache as fallback (better than nothing)
      // Update normalized lookup if needed
      if (!normalizedLookup || expiredCache !== originalCountries) {
        normalizedLookup = createNormalizedLookup(expiredCache);
        originalCountries = expiredCache;
      }
      return expiredCache;
    }

    // No cache available - throw error
    const errorMessage =
      apiError instanceof Error
        ? apiError.message
        : 'Unable to load countries. Please try again later.';

    // Provide user-friendly error message
    const userFriendlyMessage =
      errorMessage.includes('timeout') || errorMessage.includes('timed out')
        ? 'Request timed out. Please try again.'
        : 'Unable to load countries. Please try again later.';

    throw new Error(userFriendlyMessage);
  }
}

/**
 * Validate a country name against the valid countries list
 * @param countryName - The country name to validate
 * @returns Promise resolving to ValidationResult object
 */
export async function validateCountry(
  countryName: string
): Promise<ValidationResult> {
  // Input validation: null/undefined check
  if (countryName === null || countryName === undefined) {
    return {
      isValid: false,
      countryName: '',
      error: 'Country name is required',
    };
  }

  // Input validation: type check
  if (typeof countryName !== 'string') {
    return {
      isValid: false,
      countryName: '',
      error: 'Country name must be a string',
    };
  }

  // Trim whitespace
  const trimmedCountry = countryName.trim();

  // Empty string check
  if (trimmedCountry.length === 0) {
    return {
      isValid: false,
      countryName: '',
      error: 'Country name is required',
    };
  }

  try {
    // Get countries list (from cache or API)
    const countries = await getCountriesList();

    // Create or update normalized lookup if needed
    if (!normalizedLookup || countries !== originalCountries) {
      normalizedLookup = createNormalizedLookup(countries);
      originalCountries = countries;
    }

    // Normalize input (lowercase) for comparison
    const normalizedInput = trimmedCountry.toLowerCase();

    // Check if normalized input exists in countries list
    const isValid = normalizedLookup.has(normalizedInput);

    if (isValid) {
      return {
        isValid: true,
        countryName: trimmedCountry,
      };
    } else {
      return {
        isValid: false,
        countryName: trimmedCountry,
        error: `Country '${trimmedCountry}' is not recognized. Please select a valid country from the list.`,
      };
    }
  } catch {
    // Countries list unavailable
    return {
      isValid: false,
      countryName: trimmedCountry,
      error: 'Unable to validate country. Please try again later.',
    };
  }
}

/**
 * Check if a country name is valid (convenience function)
 * @param countryName - The country name to validate
 * @returns Promise resolving to boolean (true if valid, false otherwise)
 */
export async function isCountryValid(
  countryName: string
): Promise<boolean> {
  const result = await validateCountry(countryName);
  return result.isValid;
}

