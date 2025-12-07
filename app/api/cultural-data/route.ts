import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/utils/cache';
import { queryCulturalDataWithRetry } from '@/lib/api/openai-service';
import { searchSpotifyForCarol } from '@/lib/api/spotify-service';
import type {
  CulturalDataApiRequest,
  CulturalDataApiResponse,
  CountryCulturalData,
} from '@/lib/types/cultural-data';

/**
 * Cache TTL: 20 minutes in milliseconds
 */
const CACHE_TTL = 20 * 60 * 1000; // 1,200,000 milliseconds

/**
 * Get cache key for a country's cultural data
 * @param countryName - Name of the country
 * @returns Cache key string
 */
function getCacheKey(countryName: string): string {
  return `cultural-data:${countryName.toLowerCase()}`;
}

/**
 * POST /api/cultural-data
 *
 * Queries OpenAI to retrieve comprehensive cultural data (famous dishes, Christmas carol, and Spotify URL) for a selected country.
 * Implements server-side caching with a 20-minute TTL for valid responses only.
 *
 * Request body: { country: string }
 * Response: { success: true, data: CountryCulturalData } | { success: false, error: { message: string } }
 *
 * Flow:
 * 1. Validate request body contains non-empty country field
 * 2. Check cache for valid entry (not expired) for the country
 * 3. If cache hit: return cached data immediately
 * 4. If cache miss or expired:
 *    - Query OpenAI with combined prompt (dishes + carol)
 *    - Parse and validate JSON response
 *    - If invalid: retry with refined query (max 1 retry)
 *    - If valid: store in cache with 20-minute TTL, return data
 *    - If still invalid after retry: return error (do not cache)
 * 5. Handle errors gracefully with user-friendly messages
 * 6. Gracefully handle missing carol (dishes still returned if valid)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: CulturalDataApiRequest = await request.json();

    if (!body.country || typeof body.country !== 'string' || body.country.trim().length === 0) {
      return NextResponse.json<CulturalDataApiResponse>(
        {
          success: false,
          error: {
            message: 'Country name is required',
          },
        },
        { status: 400 }
      );
    }

    const countryName = body.country.trim();

    // Check cache for valid entry
    const cacheKey = getCacheKey(countryName);
    const cachedData = cache.get<CountryCulturalData>(cacheKey);
    if (cachedData) {
      // Cache hit - return cached data (includes spotifyUrl if previously searched)
      return NextResponse.json<CulturalDataApiResponse>({
        success: true,
        data: cachedData,
      });
    }

    // Cache miss or expired - query OpenAI
    try {
      const culturalData = await queryCulturalDataWithRetry(countryName);

      // Search Spotify for carol if available
      let spotifyUrl: string | null = null;
      if (culturalData.carol) {
        try {
          spotifyUrl = await searchSpotifyForCarol(culturalData.carol.name);
        } catch (error) {
          // Log error but don't fail the request - graceful degradation
          console.error('Spotify search error:', error);
          spotifyUrl = null;
        }
      }

      // Add Spotify URL to cultural data
      const culturalDataWithSpotify: CountryCulturalData = {
        ...culturalData,
        spotifyUrl,
      };

      // Store valid response in cache (only if validation passed)
      cache.set(cacheKey, culturalDataWithSpotify, CACHE_TTL);

      return NextResponse.json<CulturalDataApiResponse>({
        success: true,
        data: culturalDataWithSpotify,
      });
    } catch (error) {
      // Handle OpenAI query errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      // Check if error indicates no cultural data found
      if (
        errorMessage.includes('no dishes') ||
        errorMessage.includes('No famous dishes')
      ) {
        return NextResponse.json<CulturalDataApiResponse>(
          {
            success: false,
            error: {
              message:
                'No cultural data found for this country. Please try another country.',
            },
          },
          { status: 500 }
        );
      }

      // Check if error indicates rate limit
      if (errorMessage.includes('temporarily unavailable')) {
        return NextResponse.json<CulturalDataApiResponse>(
          {
            success: false,
            error: {
              message:
                'Service is temporarily unavailable. Please try again in a moment.',
            },
          },
          { status: 500 }
        );
      }

      // Check if error indicates service unavailable
      if (
        errorMessage.includes('Unable to connect') ||
        errorMessage.includes('service unavailable')
      ) {
        return NextResponse.json<CulturalDataApiResponse>(
          {
            success: false,
            error: {
              message:
                'Unable to connect to cultural data service. Please try again later.',
            },
          },
          { status: 500 }
        );
      }

      // Generic error response
      return NextResponse.json<CulturalDataApiResponse>(
        {
          success: false,
          error: {
            message: `Unable to retrieve cultural data for this country: ${errorMessage}. Please try again later.`,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // Handle JSON parsing errors or other request errors
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json<CulturalDataApiResponse>(
      {
        success: false,
        error: {
          message: `Invalid request: ${errorMessage}. Please check your request format.`,
        },
      },
      { status: 400 }
    );
  }
}

