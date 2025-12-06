import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/utils/cache';
import { queryDishesWithRetry } from '@/lib/api/openai-service';
import type {
  DishesApiRequest,
  DishesApiResponse,
  DishesResponse,
} from '@/lib/types/dishes';

/**
 * Cache TTL: 20 minutes in milliseconds
 */
const CACHE_TTL = 20 * 60 * 1000; // 1,200,000 milliseconds

/**
 * Get cache key for a country's dishes
 * @param countryName - Name of the country
 * @returns Cache key string
 */
function getCacheKey(countryName: string): string {
  return `dishes:${countryName}`;
}

/**
 * POST /api/dishes
 *
 * Queries OpenAI to retrieve famous dishes for a selected country.
 * Implements server-side caching with a 20-minute TTL for valid responses only.
 *
 * Request body: { country: string }
 * Response: { success: true, data: DishesResponse } | { success: false, error: { message: string } }
 *
 * Flow:
 * 1. Validate request body contains non-empty country field
 * 2. Check cache for valid entry (not expired) for the country
 * 3. If cache hit: return cached data immediately
 * 4. If cache miss or expired:
 *    - Query OpenAI with structured prompt
 *    - Parse and validate JSON response
 *    - If invalid: retry with refined query (max 1 retry)
 *    - If valid: store in cache with 20-minute TTL, return data
 *    - If still invalid after retry: return error (do not cache)
 * 5. Handle errors gracefully with user-friendly messages
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: DishesApiRequest = await request.json();

    if (!body.country || typeof body.country !== 'string' || body.country.trim().length === 0) {
      return NextResponse.json<DishesApiResponse>(
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
    const cachedDishes = cache.get<DishesResponse>(cacheKey);
    if (cachedDishes) {
      // Cache hit - return cached data
      return NextResponse.json<DishesApiResponse>({
        success: true,
        data: cachedDishes,
      });
    }

    // Cache miss or expired - query OpenAI
    try {
      const dishes = await queryDishesWithRetry(countryName);

      // Store valid response in cache (only if validation passed)
      cache.set(cacheKey, dishes, CACHE_TTL);

      return NextResponse.json<DishesApiResponse>({
        success: true,
        data: dishes,
      });
    } catch (error) {
      // Handle OpenAI query errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      // Check if error indicates no dishes found
      if (
        errorMessage.includes('no dishes') ||
        errorMessage.includes('No famous dishes')
      ) {
        return NextResponse.json<DishesApiResponse>(
          {
            success: false,
            error: {
              message:
                'No famous dishes found for this country. Please try another country.',
            },
          },
          { status: 500 }
        );
      }

      // Check if error indicates rate limit
      if (errorMessage.includes('temporarily unavailable')) {
        return NextResponse.json<DishesApiResponse>(
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
        return NextResponse.json<DishesApiResponse>(
          {
            success: false,
            error: {
              message:
                'Unable to connect to dish service. Please try again later.',
            },
          },
          { status: 500 }
        );
      }

      // Generic error response
      return NextResponse.json<DishesApiResponse>(
        {
          success: false,
          error: {
            message: `Unable to retrieve dishes for this country: ${errorMessage}. Please try again later.`,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // Handle JSON parsing errors or other request errors
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json<DishesApiResponse>(
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

