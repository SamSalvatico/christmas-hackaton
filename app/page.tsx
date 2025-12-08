'use client';

import { useState } from 'react';
import { CountryDropdown } from '@/components/features/country-dropdown';
import { SantaSearchButton } from '@/components/features/santa-search-button';
import { SearchModeSelector } from '@/components/features/search-mode-selector';
import { DishCard } from '@/components/features/dish-card';
import { ChristmasSpinner } from '@/components/features/christmas-spinner';
import { CarolLink } from '@/components/features/carol-link';
import { RecipeModal } from '@/components/features/recipe-modal';
import { ChristmasBaublesBackground } from '@/components/features/christmas-baubles-background';
import type {
  CountryCulturalData,
  CulturalDataApiResponse,
  SearchMode,
  Recipe,
  RecipeApiResponse,
} from '@/lib/types/cultural-data';
import { christmasColors } from '@/lib/utils/christmas-theme';

/**
 * Fetch cultural data (dishes, carol, and Spotify URL) for the selected country from the API
 * @param country - Country name to fetch cultural data for
 * @param mode - Search mode ('fast' or 'detailed')
 */
async function fetchCulturalData(
  country: string,
  mode: SearchMode
): Promise<CulturalDataApiResponse> {
  const response = await fetch('/api/cultural-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ country, mode }),
  });

  return response.json();
}

/**
 * Fetch recipe for a dish from the API
 * @param country - Country name where the dish originates
 * @param dishName - Name of the dish to get recipe for
 * @param mode - Search mode ('fast' or 'detailed')
 */
async function fetchRecipe(
  country: string,
  dishName: string,
  mode: SearchMode
): Promise<RecipeApiResponse> {
  const response = await fetch('/api/recipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ country, dishName, mode }),
  });

  return response.json();
}

export default function HomePage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<SearchMode>('fast');
  const [culturalData, setCulturalData] = useState<CountryCulturalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Recipe modal state
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDishName, setSelectedDishName] = useState<string | null>(null);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);

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
      const result = await fetchCulturalData(country, selectedMode);

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

  /**
   * Handle recipe click from dish card
   * @param dishName - Name of the dish
   * @param country - Country name where the dish originates
   */
  async function handleRecipeClick(dishName: string, country: string) {
    // Close existing modal if open
    if (recipeModalOpen) {
      setRecipeModalOpen(false);
    }
    
    // Set selected dish and open modal
    setSelectedDishName(dishName);
    setRecipeModalOpen(true);
    setSelectedRecipe(null);
    setRecipeError(null);
    setIsRecipeLoading(true);
    
    try {
      const result = await fetchRecipe(country, dishName, selectedMode);
      
      if (result.success && result.data) {
        setSelectedRecipe(result.data);
        setRecipeError(null);
      } else if (!result.success && 'error' in result) {
        setRecipeError(
          result.error.message ||
            'Unable to retrieve recipe. Please try again later.'
        );
        setSelectedRecipe(null);
      } else {
        setRecipeError('Unable to retrieve recipe. Please try again later.');
        setSelectedRecipe(null);
      }
    } catch (err) {
      setRecipeError(
        err instanceof Error
          ? err.message
          : 'Unable to retrieve recipe. Please try again later.'
      );
      setSelectedRecipe(null);
    } finally {
      setIsRecipeLoading(false);
    }
  }

  /**
   * Handle recipe modal close
   */
  function handleRecipeModalClose() {
    setRecipeModalOpen(false);
    setSelectedRecipe(null);
    setSelectedDishName(null);
    setRecipeError(null);
    setIsRecipeLoading(false);
  }

  /**
   * Handle recipe retry
   */
  function handleRecipeRetry() {
    if (selectedDishName && selectedCountry) {
      handleRecipeClick(selectedDishName, selectedCountry);
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

  // Check if we should show centered layout (no data, not loading, no error)
  const hasData = culturalData && (dishes.length > 0 || culturalData.carol);
  const showCentered = !hasData && !isLoading && !error;

  return (
    <main className="min-h-screen relative" style={{ backgroundColor: christmasColors.white }}>
      <ChristmasBaublesBackground />
      <div className="container mx-auto px-4 max-w-6xl relative z-10 mb-16">
        {/* Header with funny Christmas title - always visible and fixed at top */}
        <div className="text-center py-8">
          <h1
            className="text-3xl md:text-5xl font-bold christmas-font mb-6"
            style={{ color: christmasColors.red, lineHeight: '1.7' }}
          >
            Santa&apos;s Global Feast Finder
          </h1>
          <p className="text-lg md:text-xl text-gray-700 christmas-font">
            Discover Christmas traditions from around the world
          </p>
        </div>

        {/* Centered search section */}
        <div className={`flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
          showCentered ? 'min-h-[calc(100vh-400px)] mb-0' : 'mb-8'
        }`}>
          <div className="w-full max-w-md space-y-4">
            <CountryDropdown onCountrySelect={setSelectedCountry} />
            <SearchModeSelector
              selectedMode={selectedMode}
              onModeChange={setSelectedMode}
            />
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
                    <DishCard
                      key={`${dish.type}-${dish.name}`}
                      dish={dish}
                      dishType={type}
                      onRecipeClick={(dishName) => {
                        if (selectedCountry) {
                          handleRecipeClick(dishName, selectedCountry);
                        }
                      }}
                      selectedMode={selectedMode}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Carol Link */}
            {culturalData.carol && (
              <div className="flex justify-center mb-16">
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

      {/* Recipe Modal */}
      <RecipeModal
        isOpen={recipeModalOpen}
        onClose={handleRecipeModalClose}
        recipe={selectedRecipe}
        dishName={selectedDishName || ''}
        isLoading={isRecipeLoading}
        error={recipeError}
        onRetry={handleRecipeRetry}
      />
    </main>
  );
}
