# Research: Country Christmas Carol Extension

**Date**: 2024-12-19  
**Feature**: Country Christmas Carol  
**Purpose**: Research prompt engineering for combined dishes and carol query, type extensions, and integration patterns

## Technology Decisions

### Single LLM Request for Dishes and Carol

**Decision**: Include Christmas carol request in the same LLM prompt as dishes query

**Rationale**:
- Reduces API calls (single request instead of two)
- Maintains consistency with existing caching and retry logic
- Simpler implementation (no separate endpoint or service needed)
- Better user experience (all data retrieved together)
- Aligns with user requirement: "in the same request made to the LLM"

**Prompt Structure**:
```typescript
const prompt = `For the country "${countryName}", provide:
1. The most famous dishes in JSON format (same as before)
2. A famous Christmas carol from this country

For dishes, return exactly one dish for each category (entry/appetizer, main course, dessert) if available.
For the Christmas carol, include:
- name: string (carol name)
- author: string | null (author name if available, null if unknown/traditional)

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
}`;
```

**Alternatives Considered**:
- **Separate API endpoint**: More complex, requires separate caching logic, not aligned with user requirement
- **Two sequential requests**: Slower, more API calls, more complex error handling
- **Separate service module**: Unnecessary complexity, violates DRY principle

**Sources**:
- Existing prompt structure from feature 003
- OpenAI structured outputs best practices

### Type Extension Strategy

**Decision**: Extend existing `dishes.ts` types file with ChristmasCarol type and combined response type

**Rationale**:
- Maintains type organization (all country cultural data types together)
- Reuses existing type patterns and conventions
- Simple extension rather than new file
- Clear relationship between dishes and carol (both cultural data for country)

**Type Structure**:
```typescript
export interface ChristmasCarol {
  name: string;
  author: string | null;
  country: string;
}

export interface CountryCulturalData {
  dishes: DishesResponse;
  carol: ChristmasCarol | null;
}
```

**Alternatives Considered**:
- **Separate types file**: Unnecessary file proliferation, breaks cohesion
- **Inline types**: Less reusable, harder to maintain
- **Extend DishesResponse**: Violates single responsibility, carol is not a dish

**Sources**:
- Existing type patterns from feature 003
- TypeScript best practices for type organization

### Caching Strategy

**Decision**: Cache carol information together with dishes in the same cache entry

**Rationale**:
- Single cache entry per country (simpler cache management)
- Consistent TTL (20 minutes for both dishes and carol)
- Atomic updates (both dishes and carol updated together)
- Aligns with single LLM request pattern
- Reuses existing cache utility without modification

**Cache Key**: `'dishes:{countryName}'` (same as feature 003, but now contains combined data)

**Cache Entry Structure**:
```typescript
{
  data: CountryCulturalData, // Contains both dishes and carol
  timestamp: number,
  ttl: number // 20 minutes
}
```

**Alternatives Considered**:
- **Separate cache entries**: More complex, potential inconsistency, unnecessary
- **Different TTL for carol**: Inconsistent with dishes, more complex logic
- **No caching for carol**: Violates user requirement, increases API calls

**Sources**:
- Existing cache utility from feature 003
- Cache patterns from feature 002

### Retry Logic Strategy

**Decision**: Reuse existing retry logic from feature 003 (no changes needed)

**Rationale**:
- Retry logic already handles invalid/malformed responses
- Works for combined dishes and carol response
- Refined prompt includes both dishes and carol requirements
- No additional complexity needed

**Refined Prompt Structure**:
```typescript
const refinedPrompt = `${originalPrompt}

IMPORTANT: You must respond with valid JSON only. Ensure:
- All required fields for dishes are present
- Carol object has name field (required) and author field (null if unknown)
- JSON is properly formatted and parseable
- At least one dish category must be non-null OR carol must be non-null`;
```

**Alternatives Considered**:
- **Separate retry logic for carol**: Unnecessary complexity, violates DRY
- **Different retry strategy**: Inconsistent with existing patterns

**Sources**:
- Existing retry logic from feature 003
- Error handling patterns from feature 003

### Error Handling Strategy

**Decision**: Reuse existing error handling from feature 003 (no changes needed)

**Rationale**:
- Error handling already covers all scenarios (rate limits, timeouts, invalid responses)
- Works for combined dishes and carol response
- User-friendly messages already implemented
- No additional error scenarios for carol

**Error Scenarios** (same as dishes):
- Rate limited: "Service is temporarily unavailable. Please try again in a moment."
- Service unavailable: "Unable to connect to dish service. Please try again later."
- Invalid response: Automatic retry with refined query
- Missing carol: Gracefully handled (dishes still displayed)

**Alternatives Considered**:
- **Separate error handling for carol**: Unnecessary complexity
- **Different error messages**: Inconsistent user experience

**Sources**:
- Existing error handling from feature 003
- User-centric design principles

## Best Practices Identified

### Prompt Engineering for Combined Queries

1. **Clear Structure**: Separate sections for dishes and carol in prompt
2. **Explicit Format**: JSON structure clearly defined with all fields
3. **Optional Fields**: Clearly indicate which fields are optional (author)
4. **Null Handling**: Explicitly state when null values are acceptable

### Type Extensions

1. **Cohesive Types**: Keep related types together (dishes and carol are both cultural data)
2. **Optional Fields**: Use `| null` for optional fields (author)
3. **Combined Types**: Create combined response type for atomic operations
4. **Backward Compatibility**: Consider existing code when extending types

### Integration Patterns

1. **Minimal Changes**: Extend existing code rather than creating new modules
2. **Reuse Infrastructure**: Leverage existing caching, retry, and error handling
3. **Consistent Patterns**: Follow same patterns as existing features
4. **Atomic Operations**: Cache and update dishes and carol together

## Dependencies

### Existing Dependencies (Reused)

- `next@^16.0.7`: Next.js framework
- `react@^19.2.1`: React library
- `openai@^4.x`: OpenAI SDK (already installed)
- `typescript@^5.9.3`: TypeScript compiler
- Existing cache utility from feature 002
- Existing OpenAI service from feature 003

### No New Dependencies Required

This feature extends existing functionality and requires no new dependencies.

## Configuration

### No New Configuration Required

- Uses existing `OPENAI_API_KEY` environment variable
- Uses existing cache TTL (20 minutes)
- Uses existing retry logic configuration
- Uses existing error handling configuration

## Open Questions Resolved

1. **Q: Should carol be in separate request?** → A: No, same request as dishes (user requirement)
2. **Q: Should carol have separate cache?** → A: No, cache together with dishes (simpler, atomic)
3. **Q: Should carol have separate types file?** → A: No, extend existing dishes.ts (cohesive types)
4. **Q: Should carol have separate API endpoint?** → A: No, extend existing /api/dishes endpoint
5. **Q: How to handle missing carol?** → A: Gracefully (null carol, display dishes only)

## References

- [Feature 003 Implementation Plan](../003-country-dishes/plan.md)
- [Feature 003 Research](../003-country-dishes/research.md)
- [Feature 003 Data Model](../003-country-dishes/data-model.md)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [OpenAI JSON Mode](https://platform.openai.com/docs/guides/text-generation/json-mode)

