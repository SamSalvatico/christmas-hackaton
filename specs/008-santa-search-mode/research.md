# Research: Santa Search Response Mode Selection

**Feature**: 008-santa-search-mode  
**Date**: 2024-12-19  
**Purpose**: Resolve technical clarifications and establish implementation patterns

## Research Questions

### 1. HeroUI Select Component for Mode Selection

**Decision**: Use HeroUI `Select` component for mode selection dropdown

**Rationale**:
- HeroUI is already installed and used in the project (`@heroui/react`)
- `Select` component provides clean dropdown UI with built-in accessibility
- Consistent with existing UI patterns (CountryDropdown uses `Autocomplete`)
- Supports controlled selection with `selectedKeys` prop
- Built-in styling and theming support

**Implementation Pattern**:
```typescript
import { Select, SelectItem } from '@heroui/react';

<Select
  label="Santa Search Mode"
  selectedKeys={selectedMode ? [selectedMode] : []}
  onSelectionChange={handleModeChange}
  defaultSelectedKeys={['fast']}
  size="lg"
>
  <SelectItem key="fast" value="fast">Fast search</SelectItem>
  <SelectItem key="detailed" value="detailed">Detective Santa</SelectItem>
</Select>
```

**Alternatives Considered**:
- **Radio buttons**: More visual but takes more space, less consistent with dropdown pattern
- **Toggle switch**: Binary choice but less clear for two distinct modes
- **Custom dropdown**: Unnecessary when HeroUI provides tested, accessible component

**Sources**:
- [HeroUI Select Documentation](https://heroui.com/docs/components/select)
- Existing `CountryDropdown` component implementation

---

### 2. OpenAI Model Selection: gpt-3.5-turbo vs o4-mini

**Decision**: Use `gpt-3.5-turbo` for "Fast search" mode and `o4-mini` for "Detective Santa" mode

**Rationale**:
- `gpt-3.5-turbo`: Faster response times, lower cost, suitable for concise responses
- `o4-mini`: More capable model for detailed, comprehensive responses (assuming o4-mini is a newer/more capable model - note: actual model name may need verification)
- Model selection based on user's explicit choice between speed and detail
- Different models naturally produce different response characteristics

**Model Characteristics**:
- **gpt-3.5-turbo**: 
  - Faster inference time
  - Lower token cost
  - Good for concise, structured responses
  - Sufficient for basic cultural data queries
  
- **o4-mini** (or equivalent detailed model):
  - More capable for comprehensive responses
  - Better at generating detailed descriptions
  - Higher token cost but richer output
  - Suitable for in-depth cultural context

**Implementation Pattern**:
```typescript
type SearchMode = 'fast' | 'detailed';

const MODEL_MAP: Record<SearchMode, string> = {
  fast: 'gpt-3.5-turbo',
  detailed: 'o4-mini', // Note: Verify actual model name
};

async function queryCulturalData(
  countryName: string,
  mode: SearchMode
): Promise<CountryCulturalData> {
  const model = MODEL_MAP[mode];
  // Use model in OpenAI API call
}
```

**Alternatives Considered**:
- **Same model with different prompts**: Less effective, model capabilities matter more
- **Temperature/max_tokens differences**: Can help but model choice has bigger impact
- **Single model for both**: Doesn't meet requirement for distinct speed/detail trade-off

**Sources**:
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- Existing `openai-service.ts` implementation

**Note**: Verify that "o4-mini" is the correct model name. If not available, consider alternatives like `gpt-4-turbo-preview` or `gpt-4` for detailed mode.

---

### 3. Cache Key Generation Pattern

**Decision**: Use cache keys in format `cultural-data:{country}:{mode}` to ensure independent caching per mode

**Rationale**:
- Cache keys must include both country name and mode to prevent cross-contamination
- Format: `cultural-data:{country.toLowerCase()}:{mode}` ensures uniqueness
- Maintains consistency with existing cache key pattern (`cultural-data:{country}`)
- Easy to extend if additional modes are added in future

**Implementation Pattern**:
```typescript
type SearchMode = 'fast' | 'detailed';

function getCacheKey(countryName: string, mode: SearchMode): string {
  return `cultural-data:${countryName.toLowerCase()}:${mode}`;
}

// Usage:
const cacheKey = getCacheKey('Italy', 'fast');
// Result: "cultural-data:italy:fast"

const cacheKeyDetailed = getCacheKey('Italy', 'detailed');
// Result: "cultural-data:italy:detailed"
```

**Cache Key Examples**:
- Fast mode for Italy: `cultural-data:italy:fast`
- Detailed mode for Italy: `cultural-data:italy:detailed`
- Fast mode for France: `cultural-data:france:fast`
- Detailed mode for France: `cultural-data:france:detailed`

**Alternatives Considered**:
- **Separate cache namespaces**: More complex, unnecessary for current needs
- **Mode as prefix**: `{mode}:cultural-data:{country}` - less intuitive
- **Hash-based keys**: Overkill, string concatenation is sufficient

**Sources**:
- Existing `getCacheKey` function in `app/api/cultural-data/route.ts`
- Cache utility in `lib/utils/cache.ts`

---

### 4. API Route Parameter Handling

**Decision**: Extend existing `/api/cultural-data` POST endpoint to accept optional `mode` parameter, defaulting to 'fast'

**Rationale**:
- Maintains backward compatibility (existing calls without mode still work)
- Single endpoint for both modes reduces code duplication
- Mode parameter is optional, defaulting to 'fast' for existing behavior
- Consistent with existing request/response patterns

**Request Body Structure**:
```typescript
interface CulturalDataApiRequest {
  country: string;
  mode?: 'fast' | 'detailed'; // Optional, defaults to 'fast'
}
```

**Implementation Pattern**:
```typescript
export async function POST(request: NextRequest) {
  const body: CulturalDataApiRequest = await request.json();
  const countryName = body.country.trim();
  const mode: SearchMode = body.mode || 'fast'; // Default to fast
  
  const cacheKey = getCacheKey(countryName, mode);
  // ... rest of implementation
}
```

**Backward Compatibility**:
- Existing API calls without `mode` parameter continue to work
- Default behavior (fast mode) matches user expectation
- No breaking changes to existing clients

**Alternatives Considered**:
- **Separate endpoints**: `/api/cultural-data/fast` and `/api/cultural-data/detailed` - more RESTful but more code duplication
- **Query parameter**: `/api/cultural-data?country=Italy&mode=fast` - less consistent with existing POST pattern
- **Header-based mode**: Less discoverable, harder to debug

**Sources**:
- Existing `app/api/cultural-data/route.ts` implementation
- Next.js App Router API route patterns

---

### 5. Component Placement and Layout

**Decision**: Place mode selector directly below country dropdown, above Santa Search button

**Rationale**:
- Logical flow: Select country → Choose mode → Search
- Visual hierarchy: Mode selection is part of search configuration
- Consistent spacing with existing `space-y-4` layout
- Clear visual grouping of search-related controls

**Layout Structure**:
```tsx
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
```

**Alternatives Considered**:
- **Above country dropdown**: Less logical, mode should come after country selection
- **Inline with button**: Too cramped, reduces clarity
- **Separate section**: Breaks visual flow of search configuration

**Sources**:
- Existing `app/page.tsx` layout structure
- UX best practices for form flow

---

## Summary of Decisions

1. **UI Component**: HeroUI `Select` component for mode selection
2. **Model Mapping**: `gpt-3.5-turbo` for fast, `o4-mini` for detailed (verify model name)
3. **Cache Keys**: Format `cultural-data:{country}:{mode}` for independent caching
4. **API Design**: Extend existing endpoint with optional `mode` parameter, default 'fast'
5. **Layout**: Mode selector below country dropdown, above search button

## Open Questions Resolved

- ✅ Component library choice: HeroUI Select
- ✅ Model selection strategy: Different models for different modes
- ✅ Cache key format: Include both country and mode
- ✅ API design: Optional parameter with default
- ✅ UI placement: Below country dropdown

## Implementation Notes

- Verify actual OpenAI model name for detailed mode (o4-mini may need to be updated)
- Ensure backward compatibility when extending API
- Test cache isolation between modes thoroughly
- Consider adding mode indicator in response for debugging

