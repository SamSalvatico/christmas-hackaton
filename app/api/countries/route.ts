import { NextRequest, NextResponse } from 'next/server';
import { getCountriesList } from '@/lib/api/countries-service';
import type {
  CountriesApiResponse,
} from '@/lib/types/countries';

/**
 * GET /api/countries
 * Returns a list of country names with server-side caching (10 minutes TTL)
 * 
 * Note: This endpoint has been refactored to use countries-service.ts for
 * fetching and caching logic, maintaining the same external API contract.
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const countries = await getCountriesList();

    const response: CountriesApiResponse = {
      success: true,
      data: countries,
    };
    return NextResponse.json(response);
  } catch (apiError) {
    // Handle errors from service
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
}

