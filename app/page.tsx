'use client';

import { useState } from 'react';
import { CountryDropdown } from '@/components/features/country-dropdown';
import { SantaSearchButton } from '@/components/features/santa-search-button';
import { DishCard } from '@/components/features/dish-card';
import { ChristmasSpinner } from '@/components/features/christmas-spinner';
import { CarolLink } from '@/components/features/carol-link';
import { ChristmasBaublesBackground } from '@/components/features/christmas-baubles-background';
import type {
  CountryCulturalData,
  CulturalDataApiResponse,
} from '@/lib/types/cultural-data';
import { christmasColors } from '@/lib/utils/christmas-theme';

/**
 * Fetch cultural data (dishes, carol, and Spotify URL) for the selected country from the API
 * @param country - Country name to fetch cultural data for
 */
async function fetchCulturalData(country: string): Promise<CulturalDataApiResponse> {
  const response = await fetch('/api/cultural-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ country }),
  });

  return response.json();
}

export default function HomePage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [culturalData, setCulturalData] = useState<CountryCulturalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle cultural data search triggered by Santa Search button
   * @param country - Selected country name
   */
  async function handleCulturalSearch(country: string) {
    // Clear previous results
    setCulturalData(null);
    setError(null);
    setIsLoading(true);

    try {
      const result = await fetchCulturalData(country);

      if (result.success && result.data) {
        setCulturalData(result.data);
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

  // Get dishes array for display
  const dishes = culturalData
    ? [
        ...(culturalData.dishes.entry ? [{ dish: culturalData.dishes.entry, type: 'Entry' as const }] : []),
        ...(culturalData.dishes.main ? [{ dish: culturalData.dishes.main, type: 'Main Course' as const }] : []),
        ...(culturalData.dishes.dessert ? [{ dish: culturalData.dishes.dessert, type: 'Dessert' as const }] : []),
      ]
    : [];

  return (
    <main className="min-h-screen relative" style={{ backgroundColor: christmasColors.white }}>
      <ChristmasBaublesBackground />
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header with funny Christmas title */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{ color: christmasColors.red }}
          >
            🎄 Santa&apos;s Global Feast Finder 🎄
          </h1>
          <p className="text-lg md:text-xl text-gray-700">
            Discover Christmas traditions from around the world
          </p>
        </div>

        {/* Centered search section */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-full max-w-md space-y-4">
            <CountryDropdown onCountrySelect={setSelectedCountry} />
            <div className="flex justify-center">
              <SantaSearchButton
                selectedCountry={selectedCountry}
                onSearch={handleCulturalSearch}
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center mb-8">
            <ChristmasSpinner />
          </div>
        )}
        {/* Error State */}
        {error && !isLoading && (
          <div
            className="border-2 rounded-lg p-6 mb-8 text-center"
            style={{
              borderColor: christmasColors.red,
              backgroundColor: '#FEE2E2',
            }}
          >
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: christmasColors.darkRed }}
            >
              Oops! Something went wrong
            </h2>
            <p style={{ color: christmasColors.darkRed }}>{error}</p>
          </div>
        )}

        {/* Cultural Data Display */}
        {culturalData && !isLoading && !error && (
          <div className="space-y-6">
            {/* Dish Cards Grid */}
            {dishes.length > 0 && (
              <div>
                <h2
                  className="text-2xl font-bold mb-4 text-center"
                  style={{ color: christmasColors.darkGreen }}
                >
                  🍽️ Christmas Dishes from {selectedCountry}
                </h2>
                <div
                  className={`grid gap-6 ${
                    dishes.length === 1
                      ? 'grid-cols-1 md:grid-cols-1'
                      : dishes.length === 2
                      ? 'grid-cols-1 md:grid-cols-2'
                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  }`}
                >
                  {dishes.map(({ dish, type }) => (
                    <DishCard key={`${dish.type}-${dish.name}`} dish={dish} dishType={type} />
                  ))}
                </div>
              </div>
            )}

            {/* Carol Link */}
            {culturalData.carol && (
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <CarolLink
                    carol={culturalData.carol}
                    spotifyUrl={culturalData.spotifyUrl ?? null}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
