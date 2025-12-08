# Data Model: Santa Search Response Mode Selection

**Feature**: 008-santa-search-mode  
**Date**: 2024-12-19

## Overview

This feature extends the existing cultural data search system to support two response modes (fast and detailed) with independent caching per mode. The data model includes new types for search mode selection and extends existing types to support mode parameters.

## Entities

### 1. SearchMode

**Type**: String literal union type  
**Purpose**: Represents the user's choice of response mode

**Definition**:
```typescript
type SearchMode = 'fast' | 'detailed';
```

**Values**:
- `'fast'`: Fast search mode using gpt-3.5-turbo model
- `'detailed'`: Detective Santa mode using o4-mini model

**Constraints**:
- Must be one of the two literal values
- Default value is `'fast'`
- Case-sensitive

**Usage**:
- Component state for mode selection
- API request parameter
- Cache key generation
- Model selection mapping

---

### 2. CulturalDataApiRequest (Extended)

**Type**: Interface (extends existing)  
**Purpose**: API request structure with optional mode parameter

**Definition**:
```typescript
interface CulturalDataApiRequest {
  /** Country name to query cultural data for */
  country: string;
  /** Optional search mode - defaults to 'fast' if not provided */
  mode?: SearchMode;
}
```

**Fields**:
- `country` (string, required): Country name to query
- `mode` (SearchMode, optional): Response mode selection, defaults to 'fast'

**Validation Rules**:
- `country` must be non-empty string after trimming
- `mode` must be 'fast' or 'detailed' if provided
- If `mode` is omitted, defaults to 'fast' for backward compatibility

**Backward Compatibility**:
- Existing API calls without `mode` parameter continue to work
- Default behavior matches previous implementation (fast mode)

---

### 3. CacheKey

**Type**: String  
**Purpose**: Unique identifier for cached cultural data responses

**Format**: `cultural-data:{country}:{mode}`

**Pattern**:
```typescript
function getCacheKey(countryName: string, mode: SearchMode): string {
  return `cultural-data:${countryName.toLowerCase()}:${mode}`;
}
```

**Examples**:
- Fast mode for Italy: `"cultural-data:italy:fast"`
- Detailed mode for Italy: `"cultural-data:italy:detailed"`
- Fast mode for France: `"cultural-data:france:fast"`
- Detailed mode for France: `"cultural-data:france:detailed"`

**Constraints**:
- Country name is lowercased for consistency
- Mode is included to ensure independent caching
- Format must match exactly for cache lookup

**Cache Isolation**:
- Each country + mode combination has its own cache entry
- Fast and detailed modes for the same country are cached separately
- No cross-contamination between modes

---

### 4. ModelMapping

**Type**: Record mapping SearchMode to OpenAI model names  
**Purpose**: Maps user-selected mode to appropriate OpenAI model

**Definition**:
```typescript
const MODEL_MAP: Record<SearchMode, string> = {
  fast: 'gpt-3.5-turbo',
  detailed: 'o4-mini', // Note: Verify actual model name
};
```

**Mapping**:
- `'fast'` → `'gpt-3.5-turbo'`
- `'detailed'` → `'o4-mini'`

**Usage**:
- Used in OpenAI service to select appropriate model
- Centralized configuration for easy updates

---

### 5. SearchModeSelectorProps

**Type**: Interface  
**Purpose**: Props for the SearchModeSelector React component

**Definition**:
```typescript
interface SearchModeSelectorProps {
  /** Currently selected mode */
  selectedMode: SearchMode;
  /** Callback when mode changes */
  onModeChange: (mode: SearchMode) => void;
}
```

**Fields**:
- `selectedMode` (SearchMode, required): Currently selected mode
- `onModeChange` (function, required): Callback invoked when user selects a different mode

**Component Contract**:
- Component displays two options: "Fast search" and "Detective Santa"
- Default selection is "Fast search" (fast mode)
- Selection change triggers `onModeChange` callback

---

## Relationships

### SearchMode → Model Selection
- One-to-one mapping: Each mode maps to exactly one OpenAI model
- Defined in `MODEL_MAP` constant

### SearchMode → Cache Key
- One-to-many: Each mode can have cache entries for multiple countries
- Cache key includes both country and mode for uniqueness

### Country + Mode → Cache Entry
- Many-to-one: Each country + mode combination maps to one cache entry
- Cache entry contains `CountryCulturalData` response

### API Request → SearchMode
- Optional relationship: Request may include mode, defaults to 'fast'
- Mode determines which model and cache key to use

## State Management

### Component State (Client-Side)

**HomePage Component**:
```typescript
const [selectedMode, setSelectedMode] = useState<SearchMode>('fast');
```

**State Flow**:
1. User selects mode in `SearchModeSelector` component
2. `onModeChange` callback updates `selectedMode` state
3. When search is triggered, `selectedMode` is included in API request
4. API uses mode to select model and cache key

### Server-Side State

**Cache State**:
- In-memory Map structure: `Map<string, CacheEntry<CountryCulturalData>>`
- Keys follow pattern: `cultural-data:{country}:{mode}`
- Each entry has independent TTL (20 minutes)

## Data Flow

### Request Flow
```
User selects country → User selects mode → User clicks search
  ↓
API Request: { country: string, mode: SearchMode }
  ↓
Generate cache key: cultural-data:{country}:{mode}
  ↓
Check cache → If hit: return cached data
  ↓
If miss: Select model based on mode → Query OpenAI → Cache result → Return data
```

### Cache Isolation Flow
```
Fast mode request for Italy
  ↓
Cache key: "cultural-data:italy:fast"
  ↓
Check cache for this key only
  ↓
Detailed mode request for Italy
  ↓
Cache key: "cultural-data:italy:detailed"
  ↓
Check cache for this key only (different from fast mode)
```

## Validation Rules

### SearchMode Validation
- Must be exactly `'fast'` or `'detailed'`
- Case-sensitive
- No other values allowed

### API Request Validation
- `country` field: Required, non-empty string after trimming
- `mode` field: Optional, must be 'fast' or 'detailed' if provided
- Default `mode` to 'fast' if not provided

### Cache Key Validation
- Must include country name (lowercased)
- Must include mode ('fast' or 'detailed')
- Format must match: `cultural-data:{country}:{mode}`

## Type Extensions

### Existing Types (No Changes)
- `CountryCulturalData`: Response structure unchanged
- `Dish`: Dish entity unchanged
- `ChristmasCarol`: Carol entity unchanged
- `DishesResponse`: Dishes response structure unchanged

### New Types
- `SearchMode`: New type for mode selection
- `CulturalDataApiRequest`: Extended with optional `mode` field
- `SearchModeSelectorProps`: New component props interface

## Migration Considerations

### Backward Compatibility
- Existing API calls without `mode` parameter continue to work
- Default behavior (fast mode) matches previous implementation
- No breaking changes to response structure

### Cache Migration
- Existing cache entries (without mode) remain valid but won't be used
- New cache entries include mode in key
- Old cache entries will naturally expire based on TTL

## Error Handling

### Invalid Mode
- If invalid mode provided, default to 'fast'
- Log warning for invalid mode values

### Missing Mode
- If mode not provided, default to 'fast'
- No error, expected behavior for backward compatibility

### Cache Key Generation Errors
- Country name must be valid string
- Mode must be valid SearchMode value
- Errors in key generation should be logged and handled gracefully

