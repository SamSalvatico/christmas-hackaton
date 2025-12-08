/**
 * OpenAI service for querying cultural data (famous dishes and Christmas carols) by country
 */

import OpenAI from 'openai';
import type {
  Dish,
  DishesResponse,
  ChristmasCarol,
  CountryCulturalData,
  SearchMode,
  Recipe,
  RecipeStep,
} from '@/lib/types/cultural-data';

/**
 * Model mapping from search mode to OpenAI model names
 */
export const MODEL_MAP: Record<SearchMode, string> = {
  fast: 'gpt-3.5-turbo',
  detailed: 'o4-mini', // Note: Verify actual model name
};

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
 * Build structured prompt for cultural data query (dishes and carol) with explicit JSON format requirements
 * @param countryName - Name of the country to query cultural data for
 * @returns Structured prompt string
 */
export function buildCombinedPrompt(countryName: string): string {
  return `For the country "${countryName}", provide:
1. the most famous traditional dishes eaten during the Christmas holidays in JSON format
2. A famous Christmas carol from this country

For dishes, return exactly one dish for each category (entry/appetizer, main course, dessert) if available.
For each dish, include:
- name: string (dish name)
- description: string (brief 1-3 sentence description)
- ingredients: string[] (list of main ingredients)

For the Christmas carol, include:
- name: string (carol name)
- author: string | null (author/composer name if available, null if unknown/traditional)

Format the response as a JSON object with this structure:
{
  "dishes": {
    "entry": { "name": "...", "description": "...", "ingredients": [...] } | null,
    "main": { "name": "...", "description": "...", "ingredients": [...] } | null,
    "dessert": { "name": "...", "description": "...", "ingredients": [...] } | null
  },
  "carol": {
    "name": "...",
    "author": "..." | null
  } | null
}

If a dish category has no famous dishes, set it to null. If no famous Christmas carol exists, set carol to null.`;
}

/**
 * Build refined combined prompt with more explicit format requirements for retry scenarios
 * @param countryName - Name of the country to query cultural data for
 * @returns Refined prompt string with stricter format requirements
 */
export function buildRefinedCombinedPrompt(countryName: string): string {
  return `${buildCombinedPrompt(countryName)}

IMPORTANT: You must respond with valid JSON only. Ensure:
- All required fields for dishes are present (name, description, ingredients)
- Ingredients is an array of strings (not a single string or object)
- Carol object has name field (required) and author field (null if unknown)
- JSON is properly formatted and parseable
- Dish categories without dishes are set to null
- Carol is set to null if no famous Christmas carol exists
- At least one dish category must be non-null OR carol must be non-null`;
}

/**
 * Query OpenAI API for cultural data (dishes and carol) of a country
 * @param prompt - Prompt string to send to OpenAI
 * @param model - OpenAI model name to use (e.g., 'gpt-3.5-turbo', 'o4-mini')
 * @returns Parsed JSON response string from OpenAI
 * @throws Error if OpenAI API call fails
 */
async function queryDishesAndCarolForCountry(
  prompt: string,
  model: string = 'gpt-3.5-turbo'
): Promise<string> {
  const openai = initializeOpenAIClient();

  try {
    const response = await openai.chat.completions.create({
      model,
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
        throw new Error('Unable to connect to cultural data service. Please try again later.');
      }
    }

    // Re-throw with user-friendly message
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to query cultural data: ${errorMessage}`);
  }
}

/**
 * Parse carol data from parsed JSON response
 * @param carolData - Carol data from parsed JSON (can be object or null)
 * @param countryName - Country name for the carol
 * @returns Parsed ChristmasCarol object or null
 */
export function parseCarolData(
  carolData: unknown,
  countryName: string
): ChristmasCarol | null {
  if (carolData === null || carolData === undefined) {
    return null;
  }

  if (typeof carolData !== 'object') {
    return null;
  }

  const carol = carolData as Record<string, unknown>;

  // Validate carol has name field
  if (!('name' in carol) || typeof carol.name !== 'string' || carol.name.trim().length === 0) {
    return null;
  }

  // Build ChristmasCarol with type safety
  const christmasCarol: ChristmasCarol = {
    name: carol.name.trim(),
    author: null,
    country: countryName,
  };

  // Parse author if present
  if ('author' in carol) {
    if (carol.author !== null && typeof carol.author === 'string' && carol.author.trim().length > 0) {
      christmasCarol.author = carol.author.trim();
    }
  }

  return christmasCarol;
}

/**
 * Validate ChristmasCarol has non-empty name and optional author
 * @param carol - ChristmasCarol to validate (can be null)
 * @returns true if valid or null, false otherwise
 */
export function validateCarolData(carol: ChristmasCarol | null): boolean {
  if (carol === null) {
    return true; // null is valid (carol not available)
  }

  // Check required fields exist and are valid
  if (
    typeof carol.name !== 'string' ||
    carol.name.trim().length === 0
  ) {
    return false;
  }

  // Author is optional, but if present must be non-empty string
  if (carol.author !== null && (typeof carol.author !== 'string' || carol.author.trim().length === 0)) {
    return false;
  }

  return true;
}

/**
 * Parse OpenAI JSON response string into combined CountryCulturalData type
 * @param jsonString - JSON string from OpenAI API
 * @param countryName - Country name for the query
 * @returns Parsed CountryCulturalData object
 * @throws Error if JSON is invalid or cannot be parsed
 */
export function parseCombinedResponse(
  jsonString: string,
  countryName: string
): CountryCulturalData {
  try {
    const parsed = JSON.parse(jsonString) as unknown;

    // Validate it's an object
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid response format: expected object');
    }

    const response = parsed as Record<string, unknown>;

    // Parse dishes
    let dishes: DishesResponse;
    if ('dishes' in response && typeof response.dishes === 'object' && response.dishes !== null) {
      // New format with dishes object
      const dishesObj = response.dishes as Record<string, unknown>;
      dishes = {
        entry: ('entry' in dishesObj && dishesObj.entry !== null) ? (dishesObj.entry as Dish) : null,
        main: ('main' in dishesObj && dishesObj.main !== null) ? (dishesObj.main as Dish) : null,
        dessert: ('dessert' in dishesObj && dishesObj.dessert !== null) ? (dishesObj.dessert as Dish) : null,
      };
    } else if ('entry' in response || 'main' in response || 'dessert' in response) {
      // Legacy format (direct entry/main/dessert fields)
      dishes = {
        entry: ('entry' in response && response.entry !== null) ? (response.entry as Dish) : null,
        main: ('main' in response && response.main !== null) ? (response.main as Dish) : null,
        dessert: ('dessert' in response && response.dessert !== null) ? (response.dessert as Dish) : null,
      };
    } else {
      throw new Error('Invalid response format: missing dishes data');
    }

    // Parse carol
    const carol = parseCarolData(
      'carol' in response ? response.carol : null,
      countryName
    );

    return {
      dishes,
      carol,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON format';
    throw new Error(`Failed to parse combined response: ${errorMessage}`);
  }
}

/**
 * Validate combined CountryCulturalData has valid dishes and/or carol
 * @param data - CountryCulturalData to validate
 * @returns true if valid, false otherwise
 */
export function validateCombinedData(data: CountryCulturalData): boolean {
  // Validate dishes
  const hasValidDishes = data.dishes.entry !== null || data.dishes.main !== null || data.dishes.dessert !== null;
  
  if (hasValidDishes) {
    // Validate each non-null dish
    const dishes = [data.dishes.entry, data.dishes.main, data.dishes.dessert].filter(
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
  }

  // Validate carol
  const hasValidCarol = validateCarolData(data.carol);

  // At least one of dishes or carol must be valid
  return hasValidDishes || (data.carol !== null && hasValidCarol);
}

/**
 * Query cultural data (dishes and carol) for a country with automatic retry on invalid/malformed responses
 * @param countryName - Name of the country to query cultural data for
 * @param mode - Search mode ('fast' or 'detailed'), defaults to 'fast'
 * @returns Validated CountryCulturalData
 * @throws Error if query fails after retry or validation fails
 */
export async function queryCulturalDataWithRetry(
  countryName: string,
  mode: SearchMode = 'fast'
): Promise<CountryCulturalData> {
  // Get model from mode mapping
  const model = MODEL_MAP[mode];

  // First attempt with standard prompt
  let prompt = buildCombinedPrompt(countryName);
  let jsonString: string;
  let parsedResponse: CountryCulturalData;

  try {
    jsonString = await queryDishesAndCarolForCountry(prompt, model);
    parsedResponse = parseCombinedResponse(jsonString, countryName);
  } catch (error) {
    // If parsing fails, try with refined prompt
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('parse') || errorMessage.includes('Invalid')) {
      // Retry with refined prompt
      prompt = buildRefinedCombinedPrompt(countryName);
      try {
        jsonString = await queryDishesAndCarolForCountry(prompt, model);
        parsedResponse = parseCombinedResponse(jsonString, countryName);
      } catch (retryError) {
        const retryErrorMessage =
          retryError instanceof Error ? retryError.message : 'Unknown error';
        throw new Error(
          `Failed to retrieve valid data after retry: ${retryErrorMessage}`
        );
      }
    } else {
      // Non-parsing error, re-throw
      throw error;
    }
  }

  // Validate the parsed response
  if (!validateCombinedData(parsedResponse)) {
    // If validation fails, try with refined prompt
    prompt = buildRefinedCombinedPrompt(countryName);
    try {
      jsonString = await queryDishesAndCarolForCountry(prompt, model);
      parsedResponse = parseCombinedResponse(jsonString, countryName);

      // Validate again
      if (!validateCombinedData(parsedResponse)) {
        throw new Error(
          'Invalid data: response does not meet validation requirements'
        );
      }
    } catch (retryError) {
      const retryErrorMessage =
        retryError instanceof Error ? retryError.message : 'Unknown error';
      throw new Error(
        `Failed to retrieve valid data after retry: ${retryErrorMessage}`
      );
    }
  }

  // Add country and type to each dish
  if (parsedResponse.dishes.entry) {
    parsedResponse.dishes.entry.country = countryName;
    parsedResponse.dishes.entry.type = 'entry';
  }
  if (parsedResponse.dishes.main) {
    parsedResponse.dishes.main.country = countryName;
    parsedResponse.dishes.main.type = 'main';
  }
  if (parsedResponse.dishes.dessert) {
    parsedResponse.dishes.dessert.country = countryName;
    parsedResponse.dishes.dessert.type = 'dessert';
  }

  return parsedResponse;
}

/**
 * Build structured prompt for recipe query with explicit JSON format requirements
 * @param dishName - Name of the dish to get recipe for
 * @param countryName - Name of the country where the dish originates
 * @returns Structured prompt string
 */
export function buildRecipePrompt(dishName: string, countryName: string): string {
  return `Provide a step-by-step recipe for "${dishName}" from ${countryName}.

Format the recipe as a JSON object with this structure:
{
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "Step instruction text",
      "details": "Optional additional details, tips, or timing information"
    }
  ]
}

Each step should be clear and actionable. Include preparation time, cooking time, and serving size if relevant.
The recipe should be authentic to ${countryName} cuisine and Christmas traditions.
The steps array must contain at least one step, and steps must be numbered sequentially starting from 1.`;
}

/**
 * Query OpenAI API for recipe of a dish
 * @param prompt - Prompt string to send to OpenAI
 * @param model - OpenAI model name to use (e.g., 'gpt-3.5-turbo', 'o4-mini')
 * @returns Parsed Recipe object from OpenAI response
 * @throws Error if OpenAI API call fails or response is invalid
 */
async function queryRecipeForDish(
  prompt: string,
  model: string
): Promise<Recipe> {
  const openai = initializeOpenAIClient();

  try {
    const response = await openai.chat.completions.create({
      model,
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

    // Parse JSON response
    let parsedResponse: { steps?: RecipeStep[] };
    try {
      parsedResponse = JSON.parse(content);
    } catch {
      throw new Error('Invalid JSON response from OpenAI API');
    }

    // Validate response structure
    if (!parsedResponse.steps || !Array.isArray(parsedResponse.steps)) {
      throw new Error('Invalid recipe format: missing steps array');
    }

    if (parsedResponse.steps.length === 0) {
      throw new Error('Invalid recipe format: steps array is empty');
    }

    // Validate each step
    for (let i = 0; i < parsedResponse.steps.length; i++) {
      const step = parsedResponse.steps[i];
      if (!step.stepNumber || !step.instruction) {
        throw new Error(`Invalid recipe format: step ${i + 1} is missing required fields`);
      }
      if (typeof step.stepNumber !== 'number' || step.stepNumber < 1) {
        throw new Error(`Invalid recipe format: step ${i + 1} has invalid stepNumber`);
      }
      if (typeof step.instruction !== 'string' || step.instruction.trim().length === 0) {
        throw new Error(`Invalid recipe format: step ${i + 1} has invalid instruction`);
      }
    }

    return {
      steps: parsedResponse.steps,
    };
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
        throw new Error('Unable to connect to recipe service. Please try again later.');
      }
      throw new Error(`Unable to generate recipe: ${error.message}`);
    }

    // Re-throw validation errors
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to generate recipe. Please try again later.');
  }
}

/**
 * Query recipe for a dish with retry logic
 * @param dishName - Name of the dish to get recipe for
 * @param countryName - Name of the country where the dish originates
 * @param mode - Search mode ('fast' or 'detailed')
 * @returns Recipe object with step-by-step instructions
 * @throws Error if recipe generation fails after retries
 */
export async function queryRecipeWithRetry(
  dishName: string,
  countryName: string,
  mode: SearchMode = 'fast'
): Promise<Recipe> {
  const model = MODEL_MAP[mode];
  const prompt = buildRecipePrompt(dishName, countryName);

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const recipe = await queryRecipeForDish(prompt, model);
      
      // Handle dishes without traditional recipes gracefully
      if (!recipe.steps || recipe.steps.length === 0) {
        throw new Error(
          `Unable to generate a traditional recipe for "${dishName}" from ${countryName}. ` +
          'This dish may not have a standard recipe format, or the information is not available.'
        );
      }
      
      return recipe;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');

      // Don't retry on validation errors or dishes without recipes
      if (
        lastError.message.includes('Invalid recipe format') ||
        lastError.message.includes('Invalid JSON') ||
        lastError.message.includes('Unable to generate a traditional recipe')
      ) {
        throw lastError;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw lastError || new Error('Unable to generate recipe. Please try again later.');
}

