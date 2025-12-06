# Quickstart: Country Famous Dishes

**Date**: 2024-12-19  
**Feature**: Country Famous Dishes

## Overview

This feature queries OpenAI to retrieve famous dishes for a selected country, categorizes them by type (entry/appetizer, main course, dessert), and displays the results as JSON on the home page after the user clicks the Santa Search button.

## Prerequisites

- Node.js 24 or later
- Next.js 16 application running
- OpenAI API key
- TypeScript strict mode enabled

## Quick Start

### 1. Install Dependencies

Install the OpenAI SDK:

```bash
npm install openai
```

### 2. Configure Environment Variables

Create or update `.env.local` file in the project root:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

**Important**: 
- Never commit `.env.local` to git (it should be in `.gitignore`)
- Get your API key from [OpenAI API Keys](https://platform.openai.com/account/api-keys)

### 3. Implementation Files

The feature consists of the following files:

```text
app/
├── api/
│   └── dishes/
│       └── route.ts          # POST /api/dishes endpoint
└── page.tsx                   # Home page (updated to display JSON)

components/
└── features/
    └── santa-search-button.tsx # Updated to trigger dish search

lib/
├── api/
│   └── openai-service.ts     # OpenAI SDK integration
└── types/
    └── dishes.ts             # TypeScript type definitions
```

### 4. API Endpoint

**Endpoint**: `POST /api/dishes`

**Usage**:
```typescript
const response = await fetch('/api/dishes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ country: 'Italy' }),
});
const result = await response.json();

if (result.success) {
  const dishes = result.data; // DishesResponse
} else {
  console.error(result.error.message);
}
```

**Response Format**:
- **Success**: `{ success: true, data: { entry: Dish | null, main: Dish | null, dessert: Dish | null } }`
- **Error**: `{ success: false, error: { message: string } }`

### 5. Cache Behavior

- **Storage**: In-memory cache (JavaScript `Map`)
- **TTL**: 20 minutes (1,200,000 milliseconds)
- **Cache Key**: `'dishes:{countryName}'`
- **Automatic Expiration**: Cache expires after 20 minutes, automatically refreshes on next request
- **Important**: Only valid responses are cached. Invalid or malformed responses are not stored.

### 6. Home Page Integration

The home page (`app/page.tsx`) will:
- Display JSON content after Santa Search button is clicked
- Show loading state while querying OpenAI
- Display error messages if query fails
- Show cached results if available

### 7. Usage Flow

1. **Country Selection**: User selects a country from the dropdown (feature 002)
2. **Search Action**: User clicks "Santa Search" button
3. **API Call**: System queries `/api/dishes` with selected country
4. **Cache Check**: API checks cache, uses cached data if available
5. **OpenAI Query**: If no cache, queries OpenAI with structured prompt
6. **Response Processing**: Parses and validates JSON response
7. **Retry Logic**: If invalid, retries with refined query (max 1 retry)
8. **Caching**: If valid, caches response for 20 minutes
9. **Display**: JSON content displayed on page

## Configuration

### Required Configuration

- **OpenAI API Key**: Must be set in `.env.local` as `OPENAI_API_KEY`
- **Model**: Default `gpt-4` or `gpt-3.5-turbo` (configurable in code)
- **Temperature**: 0.7 (balanced)
- **Max Tokens**: 1000 (sufficient for dish information)

### Optional Customization

If you need to customize the cache TTL or OpenAI settings, modify:
- `lib/api/openai-service.ts` - OpenAI model, temperature, max_tokens
- `app/api/dishes/route.ts` - Cache TTL constant (currently 20 minutes)

## Testing

### Manual Testing

1. **First Search**:
   - Select a country (e.g., "Italy")
   - Click "Santa Search" button
   - Verify JSON content appears on page
   - Check browser console for any errors

2. **Cache Behavior**:
   - Search for same country again (within 20 minutes)
   - Verify response is instant (from cache)
   - Wait 20+ minutes, search again
   - Verify fresh data is fetched

3. **Partial Categories**:
   - Search for a country that might not have all categories
   - Verify only available categories are shown (null for missing ones)

4. **Error Handling**:
   - Search with invalid country name
   - Verify user-friendly error message is displayed

5. **Retry Logic**:
   - Simulate invalid response (if possible)
   - Verify system retries with refined query

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
#     "entry": { "name": "...", "description": "...", "ingredients": [...] },
#     "main": { "name": "...", "description": "...", "ingredients": [...] },
#     "dessert": { "name": "...", "description": "...", "ingredients": [...] }
#   }
# }
```

## Troubleshooting

### API Key Not Found

- **Check**: Verify `OPENAI_API_KEY` is set in `.env.local`
- **Solution**: Add `OPENAI_API_KEY=sk-...` to `.env.local` file
- **Restart**: Restart Next.js dev server after adding environment variable

### No Dishes Returned

- **Check**: Verify country name is valid and recognizable
- **Check**: Check OpenAI API response in server logs
- **Solution**: Try a different country or check OpenAI API status

### Invalid JSON Response

- **Check**: Verify OpenAI API is returning valid JSON
- **Solution**: System automatically retries with refined query
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
2. Verify JSON display works correctly
3. Check error handling for different scenarios
4. Verify caching behavior (20 minutes TTL)
5. Test retry logic with invalid responses

## References

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [API Contracts](./contracts/api-routes.md)
- [Data Model](./data-model.md)
- [Research Findings](./research.md)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)

