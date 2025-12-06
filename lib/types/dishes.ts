/**
 * Type definitions for Country Famous Dishes feature
 */

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
 * API request structure for dish queries
 */
export interface DishesApiRequest {
  /** Country name to query dishes for */
  country: string;
}

/**
 * API success response structure
 */
export interface DishesApiSuccessResponse {
  success: true;
  data: DishesResponse;
}

/**
 * API error response structure
 */
export interface DishesApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

/**
 * API response union type (success or error)
 */
export type DishesApiResponse =
  | DishesApiSuccessResponse
  | DishesApiErrorResponse;

