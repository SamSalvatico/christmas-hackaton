# Quickstart: Country Christmas Carol

**Date**: 2024-12-19  
**Feature**: Country Christmas Carol

## Overview

This feature extends feature 003 (Country Famous Dishes) to include a famous Christmas carol in the same LLM request. When a user selects a country and triggers the search, the system queries OpenAI for both dishes and a Christmas carol in a single request, returning the carol name and author (when available) alongside dish information.

## Prerequisites

- Node.js 24 or later
- Next.js 16 application running
- OpenAI API key configured (from feature 003)
- Feature 003 (Country Famous Dishes) implemented

## Quick Start

### 1. No New Dependencies Required

This feature extends existing functionality and requires no new dependencies. All required packages are already installed from feature 003.

### 2. No New Configuration Required

- Uses existing `OPENAI_API_KEY` environment variable (already configured)
- Uses existing cache TTL (20 minutes)
- Uses existing retry logic configuration
- Uses existing error handling configuration

### 3. Implementation Files

The feature modifies the following existing files:

```text
app/
└── api/
    └── dishes/
        └── route.ts          # Updated to handle carol in response

lib/
├── api/
│   └── openai-service.ts     # Updated to include carol in prompt and parsing
└── types/
    └── dishes.ts             # Extended with ChristmasCarol type

app/
└── page.tsx                   # Updated to display carol alongside dishes
```

### 4. API Endpoint

**Endpoint**: `POST /api/dishes` (same endpoint as feature 003)

**Usage**:
```typescript
const response = await fetch('/api/dishes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ country: 'Italy' }),
});
const result = await response.json();

if (result.success) {
  const { dishes, carol } = result.data; // CountryCulturalData
  // dishes: DishesResponse
  // carol: ChristmasCarol | null
} else {
  console.error(result.error.message);
}
```

**Response Format**:
- **Success**: `{ success: true, data: { dishes: DishesResponse, carol: ChristmasCarol | null } }`
- **Error**: `{ success: false, error: { message: string } }`

### 5. Cache Behavior

- **Storage**: In-memory cache (JavaScript `Map`) - same as feature 003
- **TTL**: 20 minutes (1,200,000 milliseconds) - same as feature 003
- **Cache Key**: `'dishes:{countryName}'` - same as feature 003
- **Automatic Expiration**: Cache expires after 20 minutes, automatically refreshes on next request
- **Important**: Carol information is cached together with dishes in the same cache entry. Only valid responses are cached.

### 6. Home Page Integration

The home page (`app/page.tsx`) will:
- Display carol information alongside dishes in JSON format
- Show carol name and author (when available)
- Handle missing carol gracefully (display dishes only)
- Use same loading and error states as dishes

### 7. Usage Flow

1. **Country Selection**: User selects a country from the dropdown (feature 002)
2. **Search Action**: User clicks "Santa Search" button
3. **API Call**: System queries `/api/dishes` with selected country (same as feature 003)
4. **Cache Check**: API checks cache, uses cached data if available (includes dishes and carol)
5. **OpenAI Query**: If no cache, queries OpenAI with combined prompt (dishes + carol)
6. **Response Processing**: Parses and validates JSON response (dishes and carol)
7. **Retry Logic**: If invalid, retries with refined query (max 1 retry) - same as feature 003
8. **Caching**: If valid, caches combined response for 20 minutes
9. **Display**: JSON content displayed on page (dishes and carol)

## Configuration

### No New Configuration Required

All configuration is inherited from feature 003:
- **OpenAI API Key**: Already set in `.env.local` as `OPENAI_API_KEY`
- **Model**: Default `gpt-4` or `gpt-3.5-turbo` (same as feature 003)
- **Temperature**: 0.7 (same as feature 003)
- **Max Tokens**: 1000 (may need increase for combined response)
- **Cache TTL**: 20 minutes (same as feature 003)

## Testing

### Manual Testing

1. **First Search**:
   - Select a country (e.g., "Italy")
   - Click "Santa Search" button
   - Verify JSON content appears with both dishes and carol
   - Check browser console for any errors

2. **Cache Behavior**:
   - Search for same country again (within 20 minutes)
   - Verify response is instant (from cache, includes carol)
   - Wait 20+ minutes, search again
   - Verify fresh data is fetched (dishes and carol)

3. **Missing Carol**:
   - Search for a country that might not have a famous Christmas carol
   - Verify dishes are displayed with `carol: null`

4. **Carol Without Author**:
   - Search for a country with traditional/folk carols
   - Verify carol is displayed with `author: null`

5. **Error Handling**:
   - Search with invalid country name
   - Verify user-friendly error message is displayed

6. **Retry Logic**:
   - Simulate invalid response (if possible)
   - Verify system retries with refined query (includes carol requirements)

### API Testing

```bash
# Test API endpoint directly
curl -X POST http://localhost:3000/api/dishes \
  -H "Content-Type: application/json" \
  -d '{"country": "Italy"}'

# Expected response:
# {
#   "success": true,
#   "data": {
#     "dishes": {
#       "entry": { "name": "...", "description": "...", "ingredients": [...] },
#       "main": { "name": "...", "description": "...", "ingredients": [...] },
#       "dessert": { "name": "...", "description": "...", "ingredients": [...] }
#     },
#     "carol": {
#       "name": "...",
#       "author": "..." | null
#     }
#   }
# }
```

## Troubleshooting

### API Key Not Found

- **Check**: Verify `OPENAI_API_KEY` is set in `.env.local`
- **Solution**: Add `OPENAI_API_KEY=sk-...` to `.env.local` file (from feature 003)
- **Restart**: Restart Next.js dev server after adding environment variable

### No Carol Returned

- **Check**: Verify country has famous Christmas carols
- **Check**: Check OpenAI API response in server logs
- **Solution**: Some countries may not have famous Christmas carols (carol will be null)

### Carol Without Author

- **Check**: Verify carol is traditional/folk carol (author may be unknown)
- **Solution**: This is expected behavior - author will be null for traditional carols

### Invalid JSON Response

- **Check**: Verify OpenAI API is returning valid JSON
- **Solution**: System automatically retries with refined query (includes carol requirements)
- **If persists**: Check OpenAI API status and prompt structure

### Rate Limited

- **Check**: Verify OpenAI API rate limits
- **Solution**: Wait a moment and try again, or check OpenAI API usage

### Cache Not Working

- **Check**: Verify cache utility is working correctly
- **Check**: Verify only valid responses are being cached
- **Solution**: Check cache TTL is set to 20 minutes (1,200,000ms)

## Next Steps

After implementation:
1. Test with various countries
2. Verify JSON display works correctly (dishes and carol)
3. Check error handling for different scenarios
4. Verify caching behavior (20 minutes TTL, combined data)
5. Test retry logic with invalid responses
6. Verify missing carol handling (dishes still displayed)

## References

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [API Contracts](./contracts/api-routes.md)
- [Data Model](./data-model.md)
- [Research Findings](./research.md)
- [Feature 003 Implementation](../003-country-dishes/plan.md)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)

