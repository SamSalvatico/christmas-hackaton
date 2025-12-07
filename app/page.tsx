'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CountryDropdown } from '@/components/features/country-dropdown';
import { SantaSearchButton } from '@/components/features/santa-search-button';
import type {
  CountryCulturalData,
  CountryCulturalApiResponse,
} from '@/lib/types/dishes';

/**
 * Truncate ingredient list to first 8 items, adding "There's more!" if list exceeds 8
 * @param ingredients - Full list of ingredients
 * @returns Truncated list with "There's more!" message if applicable
 */
function truncateIngredients(ingredients: string[]): string[] {
  if (ingredients.length <= 8) {
    return ingredients;
  }
  return [...ingredients.slice(0, 8), "There's more!"];
}

export default function HomePage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [culturalData, setCulturalData] = useState<CountryCulturalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch dishes and carol for the selected country from the API
   * @param country - Country name to fetch cultural data for
   */
  async function fetchCulturalData(country: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country }),
      });

      const result: CountryCulturalApiResponse = await response.json();

      if (result.success && result.data) {
        // Apply ingredient truncation to dishes data
        const truncatedData: CountryCulturalData = {
          dishes: {
            entry: result.data.dishes.entry
              ? {
                  ...result.data.dishes.entry,
                  ingredients: truncateIngredients(result.data.dishes.entry.ingredients),
                }
              : null,
            main: result.data.dishes.main
              ? {
                  ...result.data.dishes.main,
                  ingredients: truncateIngredients(result.data.dishes.main.ingredients),
                }
              : null,
            dessert: result.data.dishes.dessert
              ? {
                  ...result.data.dishes.dessert,
                  ingredients: truncateIngredients(result.data.dishes.dessert.ingredients),
                }
              : null,
          },
          carol: result.data.carol,
        };
        setCulturalData(truncatedData);
      } else if (!result.success && 'error' in result) {
        setError(
          result.error.message ||
            'Unable to retrieve cultural data. Please try again later.'
        );
        setCulturalData(null);
      } else {
        setError('Unable to retrieve cultural data. Please try again later.');
        setCulturalData(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to retrieve cultural data. Please try again later.'
      );
      setCulturalData(null);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handle cultural data search triggered by Santa Search button
   * @param country - Selected country name
   */
  function handleCulturalSearch(country: string) {
    // Clear previous results
    setCulturalData(null);
    setError(null);
    // Fetch cultural data for the country
    fetchCulturalData(country);
  }

  return (
    <main className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Christmas Hackathon App
        </h1>
        <p className="text-lg text-center mb-8 text-gray-600">
          SSR Web Application with AI Integration
        </p>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <p className="text-green-600">✅ Application is running</p>
            <p className="text-sm text-gray-500 mt-2">
              One-command setup successful!
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Next.js 16 SSR</li>
              <li>TypeScript Strict Mode</li>
              <li>External Data Integration</li>
              <li>AI-Powered Processing</li>
            </ul>
          </div>
        </div>

        <div className="border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Country Search</h2>
          <div className="max-w-md space-y-4">
            <CountryDropdown onCountrySelect={setSelectedCountry} />
            <SantaSearchButton
              selectedCountry={selectedCountry}
              onSearch={handleCulturalSearch}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Loading Cultural Data...</h2>
            <p className="text-gray-600">Querying OpenAI for famous dishes and Christmas carol...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="border rounded-lg p-6 mb-8 border-red-300 bg-red-50">
            <h2 className="text-xl font-semibold mb-4 text-red-800">
              Error
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Cultural Data JSON Display */}
        {culturalData && !isLoading && !error && (
          <div className="border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Cultural Data for {selectedCountry}
            </h2>
            <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(culturalData, null, 2)}
            </pre>
          </div>
        )}

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link
              href="/external-data"
              className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
            >
              View External Data
            </Link>
            <Link
              href="/ai"
              className="block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-center"
            >
              AI Processing
            </Link>
            <Link
              href="/api/health"
              className="block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
            >
              Health Check
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

