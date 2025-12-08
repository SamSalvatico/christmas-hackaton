# Quickstart: Santa Search Response Mode Selection

**Date**: 2024-12-19  
**Feature**: 008-santa-search-mode

## Overview

This feature allows users to choose between "Fast search" (using gpt-3.5-turbo) and "Detective Santa" (using o4-mini) response modes for Santa search. A mode selector is added below the country autocomplete, and responses are cached independently per mode using cache keys that include both country name and mode type. Fast search is the default mode.

## Prerequisites

- Node.js 24 or later
- Next.js 16 application running
- OpenAI API key configured
- Feature 004 (Country Carol) or later implemented
- HeroUI components installed (`@heroui/react`)

## Quick Start

### 1. New Dependencies

No new dependencies required. HeroUI is already installed and used in the project.

### 2. Configuration

**Environment Variables**:
- `OPENAI_API_KEY`: Already configured (no changes needed)

**Model Configuration**:
- Fast mode: `gpt-3.5-turbo` (default)
- Detailed mode: `o4-mini` (verify actual model name)

### 3. Implementation Files

The feature adds/modifies the following files:

```text
app/
├── api/
│   └── cultural-data/
│       └── route.ts              # Updated to accept mode parameter
└── page.tsx                      # Updated to include mode selector state

components/
└── features/
    └── search-mode-selector.tsx  # NEW: Mode selector component

lib/
├── api/
│   └── openai-service.ts         # Updated to accept model parameter
└── types/
    └── cultural-data.ts          # Extended with SearchMode type
```

### 4. API Endpoint

**Endpoint**: `POST /api/cultural-data` (extended from existing endpoint)

**Usage (Fast Mode - Default)**:
```typescript
const response = await fetch('/api/cultural-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ country: 'Italy' }),
});
const result = await response.json();
```

**Usage (Fast Mode - Explicit)**:
```typescript
const response = await fetch('/api/cultural-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ country: 'Italy', mode: 'fast' }),
});
const result = await response.json();
```

**Usage (Detailed Mode)**:
```typescript
const response = await fetch('/api/cultural-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ country: 'Italy', mode: 'detailed' }),
});
const result = await response.json();
```

**Response Format**:
- **Success**: `{ success: true, data: CountryCulturalData }`
- **Error**: `{ success: false, error: { message: string } }`

### 5. Cache Behavior

**Cache Key Format**: `cultural-data:{country}:{mode}`

**Examples**:
- Fast mode for Italy: `cultural-data:italy:fast`
- Detailed mode for Italy: `cultural-data:italy:detailed`
- Fast mode for France: `cultural-data:france:fast`

**Cache Characteristics**:
- **TTL**: 20 minutes (1,200,000 milliseconds) per mode
- **Isolation**: Each mode maintains independent cache entries
- **Scope**: Fast and detailed modes are cached separately for the same country

**Cache Flow**:
```
Request: { country: "Italy", mode: "fast" }
  ↓
Cache Key: "cultural-data:italy:fast"
  ↓
Check cache → Hit: Return cached data (< 100ms)
           → Miss: Query OpenAI (gpt-3.5-turbo) → Cache result → Return data

Request: { country: "Italy", mode: "detailed" }
  ↓
Cache Key: "cultural-data:italy:detailed"
  ↓
Check cache → Hit: Return cached data (< 100ms)
           → Miss: Query OpenAI (o4-mini) → Cache result → Return data
```

### 6. Home Page Integration

The home page (`app/page.tsx`) will:
- Display mode selector below country dropdown
- Default to "Fast search" mode
- Pass selected mode to API request
- Display results (content detail varies by mode)

**UI Layout**:
```
[Country Dropdown]
[Search Mode Selector] ← NEW
[Santa Search Button]
```

### 7. Usage Flow

1. **Country Selection**: User selects a country from the dropdown
2. **Mode Selection**: User selects "Fast search" or "Detective Santa" (defaults to "Fast search")
3. **Search Action**: User clicks "Santa Search" button
4. **API Call**: System queries `/api/cultural-data` with country and mode
5. **Cache Check**: API checks cache using mode-specific key
6. **Model Selection**: System selects model based on mode (gpt-3.5-turbo or o4-mini)
7. **OpenAI Query**: If no cache, queries OpenAI with selected model
8. **Response Processing**: Parses and validates JSON response
9. **Caching**: If valid, caches response with mode-specific key for 20 minutes
10. **Display**: Results displayed (detail level varies by mode)

## Configuration

### Model Mapping

```typescript
const MODEL_MAP: Record<SearchMode, string> = {
  fast: 'gpt-3.5-turbo',
  detailed: 'o4-mini', // Verify actual model name
};
```

### Cache Configuration

- **TTL**: 20 minutes (1,200,000 milliseconds)
- **Storage**: In-memory cache (JavaScript `Map`)
- **Key Format**: `cultural-data:{country}:{mode}`

## Testing

### Manual Testing

1. **Fast Mode (Default)**:
   - Select a country (e.g., "Italy")
   - Verify "Fast search" is pre-selected
   - Click "Santa Search" button
   - Verify results appear quickly with concise descriptions
   - Check browser console for model used (gpt-3.5-turbo)

2. **Detailed Mode**:
   - Select a country (e.g., "Italy")
   - Select "Detective Santa" mode
   - Click "Santa Search" button
   - Verify results contain detailed descriptions with cultural context
   - Check browser console for model used (o4-mini)

3. **Mode Switching**:
   - Search for a country in fast mode
   - Switch to detailed mode
   - Search for the same country again
   - Verify different results (more detailed)
   - Verify both modes are cached independently

4. **Cache Behavior**:
   - Search for a country in fast mode
   - Search for the same country in fast mode again (within 20 minutes)
   - Verify instant response (from cache)
   - Search for the same country in detailed mode
   - Verify new query (different cache key)
   - Verify detailed mode result is cached separately

5. **Backward Compatibility**:
   - Make API call without `mode` parameter
   - Verify defaults to fast mode
   - Verify response structure unchanged

6. **Error Handling**:
   - Test with invalid country name
   - Test with invalid mode value (should default to fast)
   - Verify user-friendly error messages

### API Testing

```bash
# Test Fast Mode (Default)
curl -X POST http://localhost:3000/api/cultural-data \
  -H "Content-Type: application/json" \
  -d '{"country": "Italy"}'

# Test Fast Mode (Explicit)
curl -X POST http://localhost:3000/api/cultural-data \
  -H "Content-Type: application/json" \
  -d '{"country": "Italy", "mode": "fast"}'

# Test Detailed Mode
curl -X POST http://localhost:3000/api/cultural-data \
  -H "Content-Type: application/json" \
  -d '{"country": "Italy", "mode": "detailed"}'

# Expected response structure (same for both modes):
# {
#   "success": true,
#   "data": {
#     "dishes": { ... },
#     "carol": { ... },
#     "spotifyUrl": "..."
#   }
# }
```

### Component Testing

```typescript
// Test SearchModeSelector component
import { SearchModeSelector } from '@/components/features/search-mode-selector';

// Test mode selection
const handleModeChange = (mode: SearchMode) => {
  console.log('Mode changed to:', mode);
};

<SearchModeSelector
  selectedMode="fast"
  onModeChange={handleModeChange}
/>
```

## Troubleshooting

### Model Not Found

- **Check**: Verify model name is correct (`o4-mini` may need to be updated)
- **Solution**: Check OpenAI API documentation for available models
- **Alternative**: Use `gpt-4-turbo-preview` or `gpt-4` for detailed mode if o4-mini unavailable

### Cache Cross-Contamination

- **Check**: Verify cache keys include mode: `cultural-data:{country}:{mode}`
- **Solution**: Ensure cache key generation includes mode parameter
- **Test**: Search same country in both modes, verify different results

### Mode Not Persisting

- **Check**: Verify component state management
- **Solution**: Ensure `selectedMode` state is maintained in HomePage component
- **Test**: Change mode, verify UI updates, verify API receives correct mode

### Backward Compatibility Issues

- **Check**: Verify API defaults to 'fast' when mode is omitted
- **Solution**: Ensure optional parameter handling in API route
- **Test**: Make API call without mode parameter, verify fast mode behavior

### Performance Issues

- **Check**: Verify fast mode is actually faster (30% target)
- **Solution**: Compare response times between modes
- **Optimization**: Consider prompt optimization for faster responses

### Cache Not Working

- **Check**: Verify cache key format matches exactly
- **Check**: Verify TTL is set correctly (20 minutes)
- **Solution**: Check cache utility implementation
- **Test**: Search same country+mode twice, verify second is instant

## Next Steps

After implementation:
1. Test with various countries in both modes
2. Verify cache isolation between modes
3. Compare response times (fast should be 30% faster)
4. Compare content detail (detailed should be 50% more comprehensive)
5. Test backward compatibility (API calls without mode)
6. Verify UI/UX for mode selection
7. Test error handling for both modes
8. Verify cache hit rate (target: ≥80% for repeated searches)

## Performance Targets

- **Fast Mode Response Time**: At least 30% faster than detailed mode
- **Detailed Mode Content**: At least 50% more comprehensive than fast mode
- **Cache Response Time**: < 100ms for cached responses
- **Cache Hit Rate**: ≥ 80% for repeated searches within TTL

## References

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [API Contracts](./contracts/api-routes.md)
- [Data Model](./data-model.md)
- [Research Findings](./research.md)
- [HeroUI Select Documentation](https://heroui.com/docs/components/select)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)

