# Research: Dish Recipe Viewing

**Feature**: 009-dish-recipe-view  
**Date**: 2024-12-19  
**Purpose**: Resolve technical clarifications and establish implementation patterns

## Research Questions

### 1. HeroUI Modal Component for Recipe Display

**Decision**: Use HeroUI `Modal` component for recipe display dialog

**Rationale**:
- HeroUI is already installed and used in the project (`@heroui/react`)
- `Modal` component provides accessible dialog overlay with built-in keyboard navigation
- Consistent with existing UI patterns (HeroUI components used throughout)
- Supports backdrop click to close, escape key handling, and focus management
- Built-in styling and theming support

**Implementation Pattern**:
```typescript
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';

<Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
  <ModalContent>
    <ModalHeader>Recipe: {dishName}</ModalHeader>
    <ModalBody>
      {/* Recipe steps content */}
    </ModalBody>
    <ModalFooter>
      <Button onPress={onClose}>Close</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

**Alternatives Considered**:
- **Custom modal**: More work, less accessible, reinventing the wheel
- **Dialog HTML element**: Limited styling and accessibility features
- **Third-party modal library**: Additional dependency, HeroUI already available

**Sources**:
- [HeroUI Modal Documentation](https://heroui.com/docs/components/modal)
- Existing HeroUI component usage in project

---

### 2. Tooltip Component for Hover Feedback

**Decision**: Use HeroUI `Tooltip` component or native HTML `title` attribute for hover feedback

**Rationale**:
- HeroUI provides `Tooltip` component with consistent styling
- Simple use case (just showing "View the recipe" text) - native `title` attribute may be sufficient
- Tooltip provides better styling control and positioning
- Consistent with HeroUI design system

**Implementation Pattern**:
```typescript
import { Tooltip } from '@heroui/react';

<Tooltip content="View the recipe">
  <h3 
    className="text-xl font-bold cursor-pointer hover:underline"
    onClick={handleClick}
  >
    {dish.name}
  </h3>
</Tooltip>
```

**Alternatives Considered**:
- **Native HTML title attribute**: Simpler but less customizable
- **Custom tooltip**: Unnecessary when HeroUI provides tested component
- **CSS-only tooltip**: More complex, less accessible

**Sources**:
- [HeroUI Tooltip Documentation](https://heroui.com/docs/components/tooltip)
- Existing hover patterns in project

---

### 3. Recipe Generation Prompt Structure

**Decision**: Create a structured prompt that requests step-by-step recipe instructions for a specific dish from a country

**Rationale**:
- Clear prompt structure ensures consistent recipe format
- Including country name provides cultural context for recipe variations
- Requesting step-by-step format ensures recipes are actionable
- Can reuse existing OpenAI service patterns

**Implementation Pattern**:
```typescript
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
The recipe should be authentic to ${countryName} cuisine and Christmas traditions.`;
}
```

**Alternatives Considered**:
- **Plain text format**: Less structured, harder to parse
- **Markdown format**: More complex parsing, JSON is cleaner
- **Single text block**: Less structured, harder to display step-by-step

**Sources**:
- Existing `buildCombinedPrompt` function in `openai-service.ts`
- OpenAI API best practices for structured responses

---

### 4. Step-by-Step Recipe Display Pattern

**Decision**: Display recipe steps one at a time with a "Next Step" button, allowing users to navigate through steps sequentially

**Rationale**:
- Step-by-step navigation reduces cognitive load
- Users can focus on one step at a time
- Button-based navigation is clear and accessible
- Allows users to proceed at their own pace

**Implementation Pattern**:
```typescript
const [currentStep, setCurrentStep] = useState(0);

<ModalBody>
  {recipe && recipe.steps && recipe.steps.length > 0 && (
    <div>
      <h4 className="text-lg font-semibold mb-4">
        Step {recipe.steps[currentStep].stepNumber} of {recipe.steps.length}
      </h4>
      <p className="text-gray-700 mb-4">
        {recipe.steps[currentStep].instruction}
      </p>
      {recipe.steps[currentStep].details && (
        <p className="text-sm text-gray-600 italic mb-4">
          {recipe.steps[currentStep].details}
        </p>
      )}
      <div className="flex justify-between mt-6">
        <Button 
          isDisabled={currentStep === 0}
          onPress={() => setCurrentStep(currentStep - 1)}
        >
          Previous Step
        </Button>
        <Button 
          isDisabled={currentStep === recipe.steps.length - 1}
          onPress={() => setCurrentStep(currentStep + 1)}
        >
          Next Step
        </Button>
      </div>
    </div>
  )}
</ModalBody>
```

**Alternatives Considered**:
- **Show all steps at once**: Overwhelming, harder to follow
- **Auto-advance steps**: User loses control, may move too fast
- **Scrollable list**: Less focused, harder to track progress

**Sources**:
- UX best practices for step-by-step instructions
- Cooking app patterns (AllRecipes, Food Network)

---

### 5. Recipe Cache Key Format

**Decision**: Use cache keys in format `recipe:{dishName}:{country}:{mode}` to ensure independent caching per dish, country, and mode

**Rationale**:
- Cache keys must include dish name, country, and mode to prevent cross-contamination
- Format: `recipe:{dishName.toLowerCase()}:{country.toLowerCase()}:{mode}` ensures uniqueness
- Maintains consistency with existing cache key pattern (`cultural-data:{country}:{mode}`)
- Easy to extend if additional parameters are needed

**Implementation Pattern**:
```typescript
type SearchMode = 'fast' | 'detailed';

function getRecipeCacheKey(
  dishName: string,
  countryName: string,
  mode: SearchMode
): string {
  return `recipe:${dishName.toLowerCase().replace(/\s+/g, '-')}:${countryName.toLowerCase()}:${mode}`;
}

// Examples:
// recipe:pasta-carbonara:italy:fast
// recipe:pasta-carbonara:italy:detailed
// recipe:pasta-carbonara:france:fast
```

**Cache Key Examples**:
- Fast mode for Pasta Carbonara from Italy: `recipe:pasta-carbonara:italy:fast`
- Detailed mode for Pasta Carbonara from Italy: `recipe:pasta-carbonara:italy:detailed`
- Fast mode for Pasta Carbonara from France: `recipe:pasta-carbonara:france:fast`

**Alternatives Considered**:
- **Separate cache namespaces**: More complex, unnecessary for current needs
- **Mode as prefix**: `{mode}:recipe:{dish}:{country}` - less intuitive
- **Hash-based keys**: Overkill, string concatenation is sufficient

**Sources**:
- Existing `getCacheKey` function in `app/api/cultural-data/route.ts`
- Cache utility in `lib/utils/cache.ts`

---

### 6. Recipe API Endpoint Design

**Decision**: Create `/api/recipe` POST endpoint that accepts country name, dish name, and search mode

**Rationale**:
- RESTful API design consistent with existing `/api/cultural-data` endpoint
- POST method allows complex request body with multiple parameters
- Single endpoint for recipe retrieval simplifies client code
- Can reuse existing error handling and response patterns

**Request Body Structure**:
```typescript
interface RecipeApiRequest {
  country: string;
  dishName: string;
  mode?: 'fast' | 'detailed'; // Optional, defaults to 'fast'
}
```

**Response Structure**:
```typescript
interface RecipeApiResponse {
  success: true;
  data: {
    steps: Array<{
      stepNumber: number;
      instruction: string;
      details?: string;
    }>;
  };
} | {
  success: false;
  error: {
    message: string;
  };
}
```

**Backward Compatibility**:
- Mode parameter is optional, defaults to 'fast'
- Consistent with existing API patterns

**Alternatives Considered**:
- **GET with query parameters**: Less RESTful for complex requests, URL length limitations
- **Separate endpoints per mode**: More code duplication
- **GraphQL**: Overkill for simple query pattern

**Sources**:
- Existing `app/api/cultural-data/route.ts` implementation
- Next.js App Router API route patterns

---

### 7. Clickable Dish Name Implementation

**Decision**: Make dish name clickable by wrapping it in a clickable element (button or clickable div) with tooltip

**Rationale**:
- Maintains visual appearance of dish name while adding interactivity
- Tooltip provides clear affordance that name is clickable
- Button or clickable div ensures accessibility
- Hover state provides visual feedback

**Implementation Pattern**:
```typescript
<Tooltip content="View the recipe">
  <button
    onClick={() => handleRecipeClick(dish.name)}
    className="text-xl font-bold cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2"
    style={{ color: dishTypeColor }}
    aria-label={`View recipe for ${dish.name}`}
  >
    {dish.name}
  </button>
</Tooltip>
```

**Alternatives Considered**:
- **Separate "View Recipe" button**: Takes more space, less integrated
- **Icon next to name**: More visual clutter
- **Clickable card**: Too broad, might be confusing

**Sources**:
- Existing `DishCard` component structure
- UX best practices for clickable text

---

## Summary of Decisions

1. **Modal Component**: HeroUI `Modal` for recipe display
2. **Tooltip**: HeroUI `Tooltip` for hover feedback
3. **Recipe Prompt**: Structured JSON format with step-by-step instructions
4. **Step Display**: One step at a time with Next/Previous buttons
5. **Cache Keys**: Format `recipe:{dish}:{country}:{mode}` for independent caching
6. **API Design**: POST `/api/recipe` endpoint with country, dishName, and optional mode
7. **Clickable Name**: Button or clickable element with tooltip

## Open Questions Resolved

- ✅ Modal component choice: HeroUI Modal
- ✅ Tooltip implementation: HeroUI Tooltip
- ✅ Recipe format: JSON with step-by-step structure
- ✅ Step navigation: Button-based sequential navigation
- ✅ Cache key format: Include dish, country, and mode
- ✅ API endpoint design: POST with request body

## Implementation Notes

- Recipe generation will reuse existing OpenAI service patterns
- Cache TTL can match cultural data cache (20 minutes) or be configured independently
- Modal should be responsive and work on all device sizes
- Step navigation should handle edge cases (first step, last step)
- Error handling should provide retry option in modal
- Recipe steps should be numbered for clarity

