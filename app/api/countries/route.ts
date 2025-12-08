import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/utils/cache';
import type {
  CountriesList,
  CountriesApiResponse,
  RestCountriesResponse,
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
 * Fetch countries from REST Countries API
 * @returns Array of country names (name.common)
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
 * GET /api/countries
 * Returns a list of country names with server-side caching (10 minutes TTL)
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // Check cache first
    const cachedCountries = cache.get<CountriesList>(COUNTRIES_CACHE_KEY);

    if (cachedCountries) {
      // Cache hit - return cached data
      const response: CountriesApiResponse = {
        success: true,
        data: cachedCountries,
      };
      return NextResponse.json(response);
    }

    // Cache miss - fetch from REST Countries API
    try {
      const countries = await fetchCountriesFromAPI();

      // Store in cache with TTL
      cache.set(COUNTRIES_CACHE_KEY, countries, CACHE_TTL);

      const response: CountriesApiResponse = {
        success: true,
        data: countries,
      };
      return NextResponse.json(response);
    } catch (apiError) {
      // API fetch failed - check if we have expired cache as fallback
      const expiredCache = cache.get<CountriesList>(COUNTRIES_CACHE_KEY);

      if (expiredCache) {
        // Return expired cache as fallback (better than nothing)
        const response: CountriesApiResponse = {
          success: true,
          data: expiredCache,
        };
        return NextResponse.json(response);
      }

      // No cache available - return error
      const errorMessage =
        apiError instanceof Error
          ? apiError.message
          : 'Unable to load countries. Please try again later.';

      // Provide user-friendly error message
      const userFriendlyMessage =
        errorMessage.includes('timeout') ||
        errorMessage.includes('timed out')
          ? 'Request timed out. Please try again.'
          : 'Unable to load countries. Please try again later.';

      const response: CountriesApiResponse = {
        success: false,
        error: {
          message: userFriendlyMessage,
        },
      };

      return NextResponse.json(response, { status: 500 });
    }
  } catch {
    // Unexpected error
    const response: CountriesApiResponse = {
      success: false,
      error: {
        message: 'An unexpected error occurred. Please try again later.',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

