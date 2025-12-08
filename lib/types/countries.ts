/**
 * Type definitions for Countries API feature
 */

// Country name (string)
export type CountryName = string;

// Countries list (array of country names)
export type CountriesList = CountryName[];

// Cache entry structure
export interface CountriesCacheEntry {
  data: CountriesList;
  timestamp: number; // milliseconds since epoch
  ttl: number; // milliseconds (600,000 = 10 minutes)
}

// API Success Response
export interface CountriesApiSuccessResponse {
  success: true;
  data: CountriesList;
}

// API Error Response
export interface CountriesApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

// API Response (union type)
export type CountriesApiResponse =
  | CountriesApiSuccessResponse
  | CountriesApiErrorResponse;

// REST Countries API Response Item
export interface RestCountriesItem {
  name: {
    common: string;
    official: string;
    nativeName?: {
      [key: string]: {
        official: string;
        common: string;
      };
    };
  };
}

// REST Countries API Response
export type RestCountriesResponse = RestCountriesItem[];

/**
 * Validation result for country name validation
 * @property isValid - Whether the country name is valid
 * @property countryName - The normalized (trimmed) country name that was validated
 * @property error - Error message (only present if isValid is false)
 */
export interface ValidationResult {
  isValid: boolean;
  countryName: string;
  error?: string;
}

