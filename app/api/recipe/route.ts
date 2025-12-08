import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/utils/cache';
import { queryRecipeWithRetry } from '@/lib/api/openai-service';
import type {
  RecipeApiRequest,
  RecipeApiResponse,
  SearchMode,
} from '@/lib/types/cultural-data';

/**
 * Cache TTL: 20 minutes in milliseconds
 */
const CACHE_TTL = 20 * 60 * 1000; // 1,200,000 milliseconds

/**
 * Get cache key for a recipe
 * @param dishName - Name of the dish
 * @param countryName - Name of the country
 * @param mode - Search mode ('fast' or 'detailed')
 * @returns Cache key string in format: recipe:{dishName}:{country}:{mode}
 */
function getRecipeCacheKey(
  dishName: string,
  countryName: string,
  mode: SearchMode
): string {
  // Normalize dish name: lowercase and replace spaces with hyphens
  const normalizedDish = dishName.toLowerCase().replace(/\s+/g, '-');
  // Normalize country name: lowercase
  const normalizedCountry = countryName.toLowerCase();
  return `recipe:${normalizedDish}:${normalizedCountry}:${mode}`;
}

/**
 * POST /api/recipe
 *
 * Queries OpenAI to retrieve step-by-step recipe instructions for a specific dish from a country.
 * Uses the selected search mode (fast or detailed) to generate recipes with appropriate detail level.
 * Implements independent caching per dish, country, and mode combination.
 */
export async function POST(request: NextRequest): Promise<NextResponse<RecipeApiResponse>> {
  try {
    const body: RecipeApiRequest = await request.json();
    const { country, dishName, mode = 'fast' } = body;

    // Validate required fields
    if (!country || typeof country !== 'string' || country.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Country name is required',
          },
        },
        { status: 400 }
      );
    }

    if (!dishName || typeof dishName !== 'string' || dishName.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Dish name is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate mode if provided
    if (mode && mode !== 'fast' && mode !== 'detailed') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid mode. Must be 'fast' or 'detailed'",
          },
        },
        { status: 400 }
      );
    }

    const countryName = country.trim();
    const normalizedDishName = dishName.trim();
    const searchMode: SearchMode = mode || 'fast';

    // Generate cache key
    const cacheKey = getRecipeCacheKey(normalizedDishName, countryName, searchMode);

    // Check cache
    const cachedRecipe = cache.get<{ steps: Array<{ stepNumber: number; instruction: string; details?: string }> }>(cacheKey);
    if (cachedRecipe) {
      return NextResponse.json({
        success: true,
        data: cachedRecipe,
      });
    }

    // Generate recipe
    const recipe = await queryRecipeWithRetry(normalizedDishName, countryName, searchMode);

    // Cache the recipe
    cache.set(cacheKey, recipe, CACHE_TTL);

    return NextResponse.json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unable to retrieve recipe. Please try again later.';

    return NextResponse.json(
      {
        success: false,
        error: {
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}

