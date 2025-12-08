# Data Model: Dish Recipe Viewing

**Feature**: 009-dish-recipe-view  
**Date**: 2024-12-19

## Overview

This feature extends the existing dish display system to support recipe viewing. The data model includes new types for recipe data, API requests/responses, and component props for recipe display.

## Entities

### 1. RecipeStep

**Type**: Interface  
**Purpose**: Represents a single step in a recipe's step-by-step instructions

**Definition**:
```typescript
interface RecipeStep {
  /** Step number (1-based) */
  stepNumber: number;
  /** Main instruction for this step */
  instruction: string;
  /** Optional additional details, tips, or timing information */
  details?: string;
}
```

**Fields**:
- `stepNumber` (number, required): Sequential step number starting from 1
- `instruction` (string, required): Main instruction text for the step
- `details` (string, optional): Additional context such as cooking tips, timing, temperature

**Validation Rules**:
- `stepNumber` must be a positive integer (>= 1)
- `instruction` must be non-empty string after trimming
- `details` is optional but if present must be non-empty string

**Usage**:
- Recipe generation response from OpenAI
- Recipe display in modal
- Step-by-step navigation

---

### 2. Recipe

**Type**: Interface  
**Purpose**: Represents a complete recipe with step-by-step instructions for a dish

**Definition**:
```typescript
interface Recipe {
  /** Array of recipe steps in sequential order */
  steps: RecipeStep[];
}
```

**Fields**:
- `steps` (RecipeStep[], required): Array of recipe steps, must contain at least one step

**Validation Rules**:
- `steps` array must contain at least one step
- Steps must be in sequential order (stepNumber 1, 2, 3, etc.)
- No duplicate step numbers allowed

**Usage**:
- API response data
- Cached recipe data
- Modal display

---

### 3. RecipeApiRequest

**Type**: Interface  
**Purpose**: API request structure for recipe queries

**Definition**:
```typescript
interface RecipeApiRequest {
  /** Country name where the dish originates */
  country: string;
  /** Name of the dish to get recipe for */
  dishName: string;
  /** Optional search mode - defaults to 'fast' if not provided */
  mode?: SearchMode;
}
```

**Fields**:
- `country` (string, required): Country name where the dish originates
- `dishName` (string, required): Name of the dish to get recipe for
- `mode` (SearchMode, optional): Response mode selection, defaults to 'fast'

**Validation Rules**:
- `country` must be non-empty string after trimming
- `dishName` must be non-empty string after trimming
- `mode` must be 'fast' or 'detailed' if provided
- If `mode` is omitted, defaults to 'fast' for backward compatibility

**Backward Compatibility**:
- Existing API calls without `mode` parameter continue to work
- Default behavior matches previous implementation (fast mode)

---

### 4. RecipeApiResponse

**Type**: Union type  
**Purpose**: API response structure (success or error) for recipe queries

**Definition**:
```typescript
interface RecipeApiSuccessResponse {
  success: true;
  data: Recipe;
}

interface RecipeApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

type RecipeApiResponse = RecipeApiSuccessResponse | RecipeApiErrorResponse;
```

**Success Response**:
- `success`: Always `true`
- `data`: Recipe object with steps array

**Error Response**:
- `success`: Always `false`
- `error.message`: User-friendly error message

**Usage**:
- API route response
- Frontend fetch response handling

---

### 5. RecipeCacheKey

**Type**: String  
**Purpose**: Unique identifier for cached recipe responses

**Format**: `recipe:{dishName}:{country}:{mode}`

**Pattern**:
```typescript
function getRecipeCacheKey(
  dishName: string,
  countryName: string,
  mode: SearchMode
): string {
  const normalizedDish = dishName.toLowerCase().replace(/\s+/g, '-');
  const normalizedCountry = countryName.toLowerCase();
  return `recipe:${normalizedDish}:${normalizedCountry}:${mode}`;
}
```

**Examples**:
- Fast mode for Pasta Carbonara from Italy: `"recipe:pasta-carbonara:italy:fast"`
- Detailed mode for Pasta Carbonara from Italy: `"recipe:pasta-carbonara:italy:detailed"`
- Fast mode for Tiramisu from Italy: `"recipe:tiramisu:italy:fast"`
- Fast mode for Pasta Carbonara from France: `"recipe:pasta-carbonara:france:fast"`

**Constraints**:
- Dish name is lowercased and spaces replaced with hyphens for consistency
- Country name is lowercased
- Mode is included to ensure independent caching
- Format must match exactly for cache lookup

**Cache Isolation**:
- Each dish + country + mode combination has its own cache entry
- Fast and detailed modes for the same dish and country are cached separately
- Same dish from different countries are cached separately
- No cross-contamination between combinations

---

### 6. RecipeModalProps

**Type**: Interface  
**Purpose**: Props for the RecipeModal React component

**Definition**:
```typescript
interface RecipeModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Recipe data to display */
  recipe: Recipe | null;
  /** Dish name for modal header */
  dishName: string;
  /** Whether recipe is being loaded */
  isLoading?: boolean;
  /** Error message if recipe loading failed */
  error?: string | null;
  /** Callback to retry recipe loading */
  onRetry?: () => void;
}
```

**Fields**:
- `isOpen` (boolean, required): Controls modal visibility
- `onClose` (function, required): Callback invoked when modal should close
- `recipe` (Recipe | null, required): Recipe data to display, null if not loaded
- `dishName` (string, required): Dish name for modal header
- `isLoading` (boolean, optional): Indicates recipe is being loaded
- `error` (string | null, optional): Error message if loading failed
- `onRetry` (function, optional): Callback to retry recipe loading on error

**Component Contract**:
- Component displays recipe steps one at a time
- Navigation buttons allow moving between steps
- Loading state shows Santa loader
- Error state shows error message with retry option
- Modal can be closed via backdrop click or close button

---

### 7. DishCardProps (Extended)

**Type**: Interface (extends existing)  
**Purpose**: Extended props for DishCard component to support recipe viewing

**Definition**:
```typescript
interface DishCardProps {
  /** The dish to display */
  dish: Dish;
  /** Category label for the dish */
  dishType: 'Entry' | 'Main Course' | 'Dessert';
  /** Optional CSS classes for additional styling */
  className?: string;
  /** Callback when dish name is clicked to view recipe */
  onRecipeClick?: (dishName: string, country: string) => void;
  /** Currently selected search mode */
  selectedMode?: SearchMode;
}
```

**New Fields**:
- `onRecipeClick` (function, optional): Callback invoked when dish name is clicked
- `selectedMode` (SearchMode, optional): Current search mode for recipe generation

**Usage**:
- DishCard component receives recipe click handler
- Selected mode passed to recipe API request

---

## Relationships

### Recipe → RecipeStep
- One-to-many: Each recipe contains multiple steps
- Steps are ordered by stepNumber
- Steps must be sequential (1, 2, 3, ...)

### RecipeApiRequest → Recipe
- One-to-one: Each request generates one recipe
- Request includes dish name, country, and mode
- Recipe is cached using these parameters

### RecipeCacheKey → Recipe
- One-to-one: Each cache key maps to one recipe
- Cache key includes dish name, country, and mode
- Recipe is stored with cache key

### Dish → Recipe
- One-to-many: Each dish can have recipes for different countries and modes
- Same dish from different countries has different recipes
- Same dish in different modes has different recipes

## State Management

### Component State (Client-Side)

**HomePage Component**:
```typescript
const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
const [isRecipeLoading, setIsRecipeLoading] = useState(false);
const [recipeError, setRecipeError] = useState<string | null>(null);
const [recipeModalOpen, setRecipeModalOpen] = useState(false);
const [currentDishName, setCurrentDishName] = useState<string | null>(null);
const [currentCountry, setCurrentCountry] = useState<string | null>(null);
```

**RecipeModal Component**:
```typescript
const [currentStep, setCurrentStep] = useState(0);
```

**State Flow**:
1. User clicks dish name
2. `onRecipeClick` callback updates state (dish name, country, opens modal)
3. API request initiated with loading state
4. Recipe retrieved (cached or generated)
5. Recipe displayed in modal with step navigation
6. User navigates steps using Next/Previous buttons

### Server-Side State

**Cache State**:
- In-memory Map structure: `Map<string, CacheEntry<Recipe>>`
- Keys follow pattern: `recipe:{dish}:{country}:{mode}`
- Each entry has independent TTL (20 minutes)

## Data Flow

### Request Flow
```
User clicks dish name → onRecipeClick callback
  ↓
API Request: { country: string, dishName: string, mode: SearchMode }
  ↓
Generate cache key: recipe:{dish}:{country}:{mode}
  ↓
Check cache → If hit: return cached recipe
  ↓
If miss: Select model based on mode → Query OpenAI → Parse recipe → Cache result → Return recipe
  ↓
Display recipe in modal with step navigation
```

### Cache Isolation Flow
```
Fast mode request for Pasta Carbonara from Italy
  ↓
Cache key: "recipe:pasta-carbonara:italy:fast"
  ↓
Check cache for this key only
  ↓
Detailed mode request for Pasta Carbonara from Italy
  ↓
Cache key: "recipe:pasta-carbonara:italy:detailed"
  ↓
Check cache for this key only (different from fast mode)
```

## Validation Rules

### RecipeStep Validation
- `stepNumber` must be positive integer (>= 1)
- `instruction` must be non-empty string after trimming
- `details` is optional but must be non-empty if provided

### Recipe Validation
- `steps` array must contain at least one step
- Steps must be in sequential order (no gaps, no duplicates)
- All steps must have valid stepNumber and instruction

### API Request Validation
- `country` field: Required, non-empty string after trimming
- `dishName` field: Required, non-empty string after trimming
- `mode` field: Optional, must be 'fast' or 'detailed' if provided
- Default `mode` to 'fast' if not provided

### Cache Key Validation
- Must include dish name (lowercased, spaces to hyphens)
- Must include country name (lowercased)
- Must include mode ('fast' or 'detailed')
- Format must match: `recipe:{dish}:{country}:{mode}`

## Type Extensions

### Existing Types (No Changes)
- `Dish`: Dish entity unchanged
- `SearchMode`: Search mode type unchanged
- `CountryCulturalData`: Cultural data response unchanged

### New Types
- `RecipeStep`: New type for recipe step
- `Recipe`: New type for complete recipe
- `RecipeApiRequest`: New API request interface
- `RecipeApiResponse`: New API response union type
- `RecipeModalProps`: New component props interface
- `DishCardProps`: Extended with recipe click handler

## Migration Considerations

### Backward Compatibility
- Existing DishCard component continues to work without recipe functionality
- `onRecipeClick` prop is optional
- No breaking changes to existing dish display

### Cache Migration
- New cache entries use recipe-specific key format
- No migration needed for existing cultural data cache
- Recipe cache is independent from cultural data cache

## Error Handling

### Invalid Recipe Format
- If OpenAI returns invalid recipe format, log error and return user-friendly message
- Retry logic can be implemented if needed

### Missing Recipe Data
- If recipe generation fails, show error message in modal
- Provide retry option for user

### Cache Key Generation Errors
- Dish name must be valid string
- Country name must be valid string
- Mode must be valid SearchMode value
- Errors in key generation should be logged and handled gracefully

