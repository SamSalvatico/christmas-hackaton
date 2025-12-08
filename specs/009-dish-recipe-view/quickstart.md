# Quickstart: Dish Recipe Viewing

**Date**: 2024-12-19  
**Feature**: 009-dish-recipe-view

## Overview

This feature allows users to view step-by-step recipes for dishes by clicking on dish names. A tooltip appears on hover showing "View the recipe", and clicking opens a modal with the recipe displayed step-by-step. Recipes are generated using the selected search mode and cached independently per dish, country, and mode combination.

## Prerequisites

- Node.js 24 or later
- Next.js 16 application running
- OpenAI API key configured
- Feature 008 (Santa Search Mode Selection) implemented
- HeroUI components installed (`@heroui/react`)

## Quick Start

### 1. New Dependencies

No new dependencies required. HeroUI is already installed and used in the project.

### 2. Configuration

**Environment Variables**:
- `OPENAI_API_KEY`: Already configured (no changes needed)

**Model Configuration**:
- Fast mode: Uses fast mode model (same as fast search)
- Detailed mode: Uses detailed mode model (same as detailed search)

### 3. Implementation Files

The feature adds/modifies the following files:

```text
app/
├── api/
│   └── recipe/
│       └── route.ts              # NEW: Recipe API endpoint
└── page.tsx                      # Updated: Add recipe modal state and handlers

components/
└── features/
    ├── dish-card.tsx             # Updated: Make dish name clickable with tooltip
    └── recipe-modal.tsx          # NEW: Modal component for recipe display

lib/
├── api/
│   └── openai-service.ts         # Extended: Add recipe generation function
└── types/
    └── cultural-data.ts          # Extended: Add Recipe and RecipeStep types
```

### 4. API Endpoint

**Endpoint**: `POST /api/recipe` (new endpoint)

**Usage (Fast Mode - Default)**:
```typescript
const response = await fetch('/api/recipe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    country: 'Italy',
    dishName: 'Pasta Carbonara'
  }),
});
const result = await response.json();
```

**Usage (Fast Mode - Explicit)**:
```typescript
const response = await fetch('/api/recipe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    country: 'Italy',
    dishName: 'Pasta Carbonara',
    mode: 'fast'
  }),
});
const result = await response.json();
```

**Usage (Detailed Mode)**:
```typescript
const response = await fetch('/api/recipe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    country: 'Italy',
    dishName: 'Pasta Carbonara',
    mode: 'detailed'
  }),
});
const result = await response.json();
```

**Response Format**:
- **Success**: `{ success: true, data: { steps: RecipeStep[] } }`
- **Error**: `{ success: false, error: { message: string } }`

### 5. Cache Behavior

**Cache Key Format**: `recipe:{dishName}:{country}:{mode}`

**Examples**:
- Fast mode for Pasta Carbonara from Italy: `recipe:pasta-carbonara:italy:fast`
- Detailed mode for Pasta Carbonara from Italy: `recipe:pasta-carbonara:italy:detailed`
- Fast mode for Tiramisu from Italy: `recipe:tiramisu:italy:fast`

**Cache Characteristics**:
- **TTL**: 20 minutes (1,200,000 milliseconds) per dish/country/mode combination
- **Isolation**: Each combination maintains independent cache entries
- **Scope**: Fast and detailed modes are cached separately for the same dish and country

**Cache Flow**:
```
Request: { country: "Italy", dishName: "Pasta Carbonara", mode: "fast" }
  ↓
Cache Key: "recipe:pasta-carbonara:italy:fast"
  ↓
Check cache → Hit: Return cached recipe (< 100ms)
           → Miss: Query OpenAI (fast mode model) → Parse recipe → Cache result → Return recipe

Request: { country: "Italy", dishName: "Pasta Carbonara", mode: "detailed" }
  ↓
Cache Key: "recipe:pasta-carbonara:italy:detailed"
  ↓
Check cache → Hit: Return cached recipe (< 100ms)
           → Miss: Query OpenAI (detailed mode model) → Parse recipe → Cache result → Return recipe
```

### 6. Home Page Integration

The home page (`app/page.tsx`) will:
- Add state for recipe modal (open/close, recipe data, loading, error)
- Pass recipe click handler to DishCard components
- Pass selected search mode to recipe API requests
- Display RecipeModal component when recipe is requested

**UI Flow**:
```
User searches for dishes → Dishes displayed
  ↓
User hovers over dish name → "View the recipe" tooltip appears
  ↓
User clicks dish name → Santa loader appears → API request → Recipe modal opens
  ↓
User navigates steps → Next/Previous buttons → Close modal
```

### 7. Usage Flow

1. **Dish Search**: User selects country and mode, searches for dishes
2. **Hover Feedback**: User hovers over dish name, sees "View the recipe" tooltip
3. **Recipe Request**: User clicks on dish name
4. **Loading State**: Santa loader appears in modal
5. **API Call**: System queries `/api/recipe` with country, dishName, and mode
6. **Cache Check**: API checks cache using dish/country/mode key
7. **Recipe Generation**: If no cache, selects model based on mode → Queries OpenAI → Parses recipe
8. **Caching**: If valid, caches recipe with dish/country/mode key for 20 minutes
9. **Display**: Recipe displayed in modal with step-by-step navigation
10. **Navigation**: User navigates through steps using Next/Previous buttons

## Configuration

### Model Mapping

Uses existing `MODEL_MAP` from `openai-service.ts`:
- Fast mode: Fast mode model (same as fast search)
- Detailed mode: Detailed mode model (same as detailed search)

### Cache Configuration

- **TTL**: 20 minutes (1,200,000 milliseconds)
- **Storage**: In-memory cache (JavaScript `Map`)
- **Key Format**: `recipe:{dishName}:{country}:{mode}`

### Recipe Prompt Configuration

Recipe prompts include:
- Dish name
- Country name
- Request for step-by-step format
- JSON structure specification

## Testing

### Manual Testing

1. **Hover Feedback**:
   - Search for dishes from a country
   - Hover over a dish name
   - Verify "View the recipe" tooltip appears
   - Move cursor away, verify tooltip disappears

2. **Recipe Display (Fast Mode)**:
   - Select "Fast search" mode
   - Search for dishes
   - Click on a dish name
   - Verify Santa loader appears
   - Verify modal opens with recipe
   - Verify recipe has step-by-step format
   - Verify steps are concise but clear

3. **Recipe Display (Detailed Mode)**:
   - Select "Detective Santa" mode
   - Search for dishes
   - Click on a dish name
   - Verify modal opens with detailed recipe
   - Verify recipe has comprehensive step-by-step format
   - Verify steps include additional context (tips, timing, etc.)

4. **Step Navigation**:
   - Open a recipe modal
   - Verify first step is displayed
   - Click "Next Step" button
   - Verify second step is displayed
   - Click "Previous Step" button
   - Verify first step is displayed again
   - Navigate to last step, verify "Next Step" is disabled
   - Navigate to first step, verify "Previous Step" is disabled

5. **Cache Behavior**:
   - Click on a dish name (first time)
   - Wait for recipe to load
   - Close modal
   - Click on the same dish name again (same country and mode)
   - Verify recipe appears immediately (from cache)
   - Switch to different mode
   - Click on same dish name
   - Verify new recipe is generated (different cache key)

6. **Error Handling**:
   - Test with invalid dish name
   - Test with network error
   - Verify error message is displayed in modal
   - Verify retry option is available
   - Verify modal can be closed on error

7. **Modal Behavior**:
   - Open recipe modal
   - Click outside modal (backdrop)
   - Verify modal closes
   - Open recipe modal again
   - Press Escape key
   - Verify modal closes
   - Open recipe modal
   - Click close button
   - Verify modal closes

### API Testing

```bash
# Test Fast Mode (Default)
curl -X POST http://localhost:3000/api/recipe \
  -H "Content-Type: application/json" \
  -d '{"country": "Italy", "dishName": "Pasta Carbonara"}'

# Test Fast Mode (Explicit)
curl -X POST http://localhost:3000/api/recipe \
  -H "Content-Type: application/json" \
  -d '{"country": "Italy", "dishName": "Pasta Carbonara", "mode": "fast"}'

# Test Detailed Mode
curl -X POST http://localhost:3000/api/recipe \
  -H "Content-Type: application/json" \
  -d '{"country": "Italy", "dishName": "Pasta Carbonara", "mode": "detailed"}'

# Expected response structure:
# {
#   "success": true,
#   "data": {
#     "steps": [
#       {
#         "stepNumber": 1,
#         "instruction": "...",
#         "details": "..." | null
#       }
#     ]
#   }
# }
```

### Component Testing

```typescript
// Test RecipeModal component
import { RecipeModal } from '@/components/features/recipe-modal';

const mockRecipe = {
  steps: [
    { stepNumber: 1, instruction: "Step 1", details: "Details 1" },
    { stepNumber: 2, instruction: "Step 2", details: null },
  ],
};

<RecipeModal
  isOpen={true}
  onClose={() => {}}
  recipe={mockRecipe}
  dishName="Pasta Carbonara"
/>
```

## Troubleshooting

### Tooltip Not Appearing

- **Check**: Verify HeroUI Tooltip component is imported correctly
- **Solution**: Ensure `@heroui/react` package is installed and Tooltip is available
- **Test**: Check browser console for import errors

### Modal Not Opening

- **Check**: Verify modal state is being updated correctly
- **Check**: Verify `isOpen` prop is being passed to RecipeModal
- **Solution**: Check state management in HomePage component
- **Test**: Add console.log to verify click handler is firing

### Recipe Not Loading

- **Check**: Verify API endpoint is accessible
- **Check**: Verify OpenAI API key is configured
- **Check**: Check browser network tab for API errors
- **Solution**: Verify API route is created and accessible at `/api/recipe`
- **Test**: Test API endpoint directly with curl

### Cache Not Working

- **Check**: Verify cache key format matches exactly: `recipe:{dish}:{country}:{mode}`
- **Check**: Verify cache TTL is set correctly (20 minutes)
- **Solution**: Check cache key generation function
- **Test**: Search for same dish twice, verify second is instant

### Step Navigation Not Working

- **Check**: Verify currentStep state is being managed correctly
- **Check**: Verify step navigation buttons are enabled/disabled correctly
- **Solution**: Check RecipeModal component state management
- **Test**: Verify step numbers are sequential and valid

### Recipe Format Issues

- **Check**: Verify OpenAI response is being parsed correctly
- **Check**: Verify recipe steps array is valid
- **Solution**: Check recipe parsing logic in API route
- **Test**: Log OpenAI response to verify format

### Mode Mismatch

- **Check**: Verify selected mode is being passed to API request
- **Check**: Verify API is using correct model based on mode
- **Solution**: Check mode parameter flow from HomePage to API
- **Test**: Switch modes and verify different recipes are generated

## Next Steps

After implementation:
1. Test with various dishes and countries
2. Verify tooltip appears on hover
3. Verify modal displays correctly
4. Test step navigation
5. Verify cache isolation between modes
6. Test error handling scenarios
7. Verify responsive design on mobile devices
8. Test accessibility (keyboard navigation, screen readers)

## Performance Targets

- **Tooltip Display**: Appears within 200ms on hover
- **Cached Recipe Response**: < 100ms for cached recipes
- **Recipe Generation**: Fast mode faster than detailed mode
- **Cache Hit Rate**: ≥ 80% for repeated requests within TTL
- **Modal Display**: Opens within 100ms after recipe is loaded

## References

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [API Contracts](./contracts/api-routes.md)
- [Data Model](./data-model.md)
- [Research Findings](./research.md)
- [HeroUI Modal Documentation](https://heroui.com/docs/components/modal)
- [HeroUI Tooltip Documentation](https://heroui.com/docs/components/tooltip)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)

