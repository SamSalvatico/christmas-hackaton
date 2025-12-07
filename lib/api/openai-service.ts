/**
 * OpenAI service for querying famous dishes by country
 */

import OpenAI from 'openai';
import type {
  Dish,
  DishesResponse,
} from '@/lib/types/dishes';

/**
 * Initialize OpenAI client with API key from environment variable
 * @returns OpenAI client instance
 * @throws Error if OPENAI_API_KEY is not set
 */
function initializeOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  return new OpenAI({
    apiKey,
  });
}

/**
 * Build structured prompt for dish query with explicit JSON format requirements
 * @param countryName - Name of the country to query dishes for
 * @returns Structured prompt string
 */
export function buildDishPrompt(countryName: string): string {
  return `For the country "${countryName}", provide the most famous dishes in JSON format.
Return exactly one dish for each category (entry/appetizer, main course, dessert) if available.
For each dish, include:
- name: string (dish name)
- description: string (brief 1-3 sentence description)
- ingredients: string[] (list of main ingredients)

Format the response as a JSON object with this structure:
{
  "entry": { "name": "...", "description": "...", "ingredients": [...] } | null,
  "main": { "name": "...", "description": "...", "ingredients": [...] } | null,
  "dessert": { "name": "...", "description": "...", "ingredients": [...] } | null
}

If a category has no famous dishes, set it to null. Only include categories that have dishes.`;
}

/**
 * Build refined prompt with more explicit format requirements for retry scenarios
 * @param countryName - Name of the country to query dishes for
 * @returns Refined prompt string with stricter format requirements
 */
export function buildRefinedDishPrompt(countryName: string): string {
  return `${buildDishPrompt(countryName)}

IMPORTANT: You must respond with valid JSON only. Ensure:
- All required fields (name, description, ingredients) are present for each dish
- Ingredients is an array of strings (not a single string or object)
- JSON is properly formatted and parseable
- Categories without dishes are set to null
- At least one category must have a non-null dish value`;
}

/**
 * Query OpenAI API for dishes of a country
 * @param countryName - Name of the country to query dishes for
 * @param prompt - Prompt string to send to OpenAI
 * @returns Parsed JSON response string from OpenAI
 * @throws Error if OpenAI API call fails
 */
async function queryDishesForCountry(
  prompt: string
): Promise<string> {
  const openai = initializeOpenAIClient();

  try {
    const response = await openai.chat.completions.create({
      model: 'o4-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI API returned empty response');
    }

    return content;
  } catch (error) {
    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw new Error('Service is temporarily unavailable. Please try again in a moment.');
      }
      if (error.status === 401) {
        throw new Error('Service configuration error. Please contact support.');
      }
      if (error.status === 500 || error.status === 503) {
        throw new Error('Unable to connect to dish service. Please try again later.');
      }
    }

    // Re-throw with user-friendly message
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to query dishes: ${errorMessage}`);
  }
}

/**
 * Parse OpenAI JSON response string into DishesResponse type
 * @param jsonString - JSON string from OpenAI API
 * @returns Parsed DishesResponse object
 * @throws Error if JSON is invalid or cannot be parsed
 */
export function parseDishResponse(jsonString: string): DishesResponse {
  try {
    const parsed = JSON.parse(jsonString) as unknown;

    // Validate it's an object
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid response format: expected object');
    }

    const response = parsed as Record<string, unknown>;

    // Validate structure has entry, main, dessert fields
    if (!('entry' in response) && !('main' in response) && !('dessert' in response)) {
      throw new Error('Invalid response format: missing category fields');
    }

    // Build DishesResponse with type safety
    const dishesResponse: DishesResponse = {
      entry: null,
      main: null,
      dessert: null,
    };

    // Parse each category if present
    if ('entry' in response && response.entry !== null) {
      dishesResponse.entry = response.entry as Dish;
    }
    if ('main' in response && response.main !== null) {
      dishesResponse.main = response.main as Dish;
    }
    if ('dessert' in response && response.dessert !== null) {
      dishesResponse.dessert = response.dessert as Dish;
    }

    return dishesResponse;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON format';
    throw new Error(`Failed to parse dish response: ${errorMessage}`);
  }
}

/**
 * Validate DishesResponse has at least one non-null category and all non-null dishes have required fields
 * @param data - DishesResponse to validate
 * @returns true if valid, false otherwise
 */
export function validateDishData(data: DishesResponse): boolean {
  // Check at least one category is non-null
  if (data.entry === null && data.main === null && data.dessert === null) {
    return false;
  }

  // Validate each non-null dish
  const dishes = [data.entry, data.main, data.dessert].filter(
    (dish): dish is Dish => dish !== null
  );

  for (const dish of dishes) {
    // Check required fields exist and are valid
    if (
      typeof dish.name !== 'string' ||
      dish.name.trim().length === 0 ||
      typeof dish.description !== 'string' ||
      dish.description.trim().length === 0 ||
      !Array.isArray(dish.ingredients) ||
      dish.ingredients.length === 0 ||
      !dish.ingredients.every((ing) => typeof ing === 'string' && ing.trim().length > 0)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Query dishes for a country with automatic retry on invalid/malformed responses
 * @param countryName - Name of the country to query dishes for
 * @returns Validated DishesResponse
 * @throws Error if query fails after retry or validation fails
 */
export async function queryDishesWithRetry(
  countryName: string
): Promise<DishesResponse> {
  // First attempt with standard prompt
  let prompt = buildDishPrompt(countryName);
  let jsonString: string;
  let parsedResponse: DishesResponse;

  try {
    jsonString = await queryDishesForCountry(prompt);
    parsedResponse = parseDishResponse(jsonString);
  } catch (error) {
    // If parsing fails, try with refined prompt
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('parse') || errorMessage.includes('Invalid')) {
      // Retry with refined prompt
      prompt = buildRefinedDishPrompt(countryName);
      try {
        jsonString = await queryDishesForCountry(prompt);
        parsedResponse = parseDishResponse(jsonString);
      } catch (retryError) {
        const retryErrorMessage =
          retryError instanceof Error ? retryError.message : 'Unknown error';
        throw new Error(
          `Failed to retrieve valid dish data after retry: ${retryErrorMessage}`
        );
      }
    } else {
      // Non-parsing error, re-throw
      throw error;
    }
  }

  // Validate the parsed response
  if (!validateDishData(parsedResponse)) {
    // If validation fails, try with refined prompt
    prompt = buildRefinedDishPrompt(countryName);
    try {
      jsonString = await queryDishesForCountry(prompt);
      parsedResponse = parseDishResponse(jsonString);

      // Validate again
      if (!validateDishData(parsedResponse)) {
        throw new Error(
          'Invalid dish data: response does not meet validation requirements'
        );
      }
    } catch (retryError) {
      const retryErrorMessage =
        retryError instanceof Error ? retryError.message : 'Unknown error';
      throw new Error(
        `Failed to retrieve valid dish data after retry: ${retryErrorMessage}`
      );
    }
  }

  // Add country and type to each dish
  if (parsedResponse.entry) {
    parsedResponse.entry.country = countryName;
    parsedResponse.entry.type = 'entry';
  }
  if (parsedResponse.main) {
    parsedResponse.main.country = countryName;
    parsedResponse.main.type = 'main';
  }
  if (parsedResponse.dessert) {
    parsedResponse.dessert.country = countryName;
    parsedResponse.dessert.type = 'dessert';
  }

  return parsedResponse;
}

