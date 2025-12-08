/**
 * Type definitions for Country Cultural Data feature
 */

/**
 * Search mode type representing the user's choice of response mode
 */
export type SearchMode = 'fast' | 'detailed';

/**
 * Dish entity representing a famous dish from a country
 */
export interface Dish {
  /** The dish name */
  name: string;
  /** Brief description of the dish (typically 1-3 sentences) */
  description: string;
  /** List of main ingredients */
  ingredients: string[];
  country?: string;
  type?: 'entry' | 'main' | 'dessert';
}

/**
 * Dishes response structure organized by category
 * Each category can be a Dish object or null if not available
 */
export interface DishesResponse {
  /** Entry/appetizer dish or null if not available */
  entry: Dish | null;
  /** Main course dish or null if not available */
  main: Dish | null;
  /** Dessert dish or null if not available */
  dessert: Dish | null;
}

/**
 * Christmas Carol entity representing a famous Christmas carol from a country
 */
export interface ChristmasCarol {
  /** The carol name */
  name: string;
  /** Author/composer of the carol, or null if unknown/traditional */
  author: string | null;
  /** Country name this carol belongs to */
  country: string;
}

/**
 * Combined response structure for dishes and carol for a country
 */
export interface CountryCulturalData {
  /** Dishes response structure */
  dishes: DishesResponse;
  /** Christmas carol or null if not available */
  carol: ChristmasCarol | null;
  /** Spotify URL for the carol or null if not found/not available */
  spotifyUrl?: string | null;
}

/**
 * API request structure for cultural data queries
 */
export interface CulturalDataApiRequest {
  /** Country name to query cultural data for */
  country: string;
  /** Optional search mode - defaults to 'fast' if not provided */
  mode?: SearchMode;
}

/**
 * API success response structure (legacy - for backward compatibility)
 */
export interface DishesApiSuccessResponse {
  success: true;
  data: DishesResponse;
}

/**
 * API success response structure for cultural data
 */
export interface CulturalDataApiSuccessResponse {
  success: true;
  data: CountryCulturalData;
}

/**
 * API error response structure (legacy - for backward compatibility)
 */
export interface DishesApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

/**
 * API error response structure for cultural data
 */
export interface CulturalDataApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

/**
 * API response union type (success or error) - legacy
 */
export type DishesApiResponse =
  | DishesApiSuccessResponse
  | DishesApiErrorResponse;

/**
 * API response union type (success or error) for cultural data
 */
export type CulturalDataApiResponse =
  | CulturalDataApiSuccessResponse
  | CulturalDataApiErrorResponse;

