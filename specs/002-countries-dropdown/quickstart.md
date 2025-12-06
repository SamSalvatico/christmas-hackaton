# Quickstart: Countries Searchable Dropdown

**Date**: 2024-12-19  
**Feature**: Countries Searchable Dropdown

## Overview

This feature adds a searchable country dropdown to the home page that fetches country names from the REST Countries API, caches them server-side for 10 minutes, and allows users to search and select a country to trigger a "Santa Search" action.

## Prerequisites

- Node.js 24 or later
- Next.js 16 application running
- HeroUI already installed and configured
- TypeScript strict mode enabled

## Quick Start

### 1. Verify Dependencies

All required dependencies are already installed:

- `next@^16.0.7` - Next.js framework
- `react@^19.2.1` - React library
- `@heroui/react@^2.8.5` - HeroUI components
- `typescript@^5.9.3` - TypeScript compiler

No additional dependencies need to be installed.

### 2. Implementation Files

The feature consists of the following files:

```text
app/
├── api/
│   └── countries/
│       └── route.ts          # GET /api/countries endpoint
└── page.tsx                   # Home page (updated with dropdown)

components/
└── features/
    ├── country-dropdown.tsx   # HeroUI Select component
    └── santa-search-button.tsx # Santa Search button

lib/
├── utils/
│   └── cache.ts              # In-memory cache utility
└── types/
    └── countries.ts          # TypeScript type definitions
```

### 3. API Endpoint

**Endpoint**: `GET /api/countries`

**Usage**:

```typescript
const response = await fetch('/api/countries');
const result = await response.json();

if (result.success) {
  const countries = result.data; // string[]
} else {
  console.error(result.error.message);
}
```

**Response Format**:

- **Success**: `{ success: true, data: string[] }`
- **Error**: `{ success: false, error: { message: string } }`

### 4. Cache Behavior

- **Storage**: In-memory cache (JavaScript `Map`)
- **TTL**: 10 minutes (600,000 milliseconds)
- **Cache Key**: `'countries'`
- **Automatic Expiration**: Cache expires after 10 minutes, automatically refreshes on next request

### 5. Home Page Integration

The home page (`app/page.tsx`) will include:

- Country dropdown component (HeroUI Select)
- Search functionality (case-insensitive partial matching)
- "Santa Search" button (enabled when country is selected)
- Loading states and error handling

### 6. Usage Flow

1. **Page Load**: Home page automatically fetches countries from `/api/countries`
2. **Dropdown Population**: Countries list populates the dropdown
3. **Search**: User types in dropdown to filter countries (case-insensitive)
4. **Selection**: User selects a country from the filtered list
5. **Action**: User clicks "Santa Search" button (logs selected country to console)

## Configuration

### No Configuration Required

This feature works with default settings:

- REST Countries API endpoint: `https://restcountries.com/v3.1/all?fields=name`
- Cache TTL: 10 minutes (hardcoded)
- Timeout: 10 seconds (hardcoded)
- No environment variables needed

### Optional Customization

If you need to customize the cache TTL or timeout, modify:

- `lib/utils/cache.ts` - Cache TTL constant
- `app/api/countries/route.ts` - Timeout value

## Testing

### Manual Testing

1. **First Load**:
   - Navigate to home page
   - Verify dropdown populates with countries
   - Check browser console for any errors

2. **Search Functionality**:
   - Type in dropdown (e.g., "united")
   - Verify filtered list shows matching countries
   - Verify case-insensitive matching works

3. **Selection**:
   - Select a country from dropdown
   - Verify "Santa Search" button is enabled
   - Click button, verify console log shows selected country

4. **Cache Behavior**:
   - Load page, wait 10+ minutes
   - Reload page, verify fresh data is fetched

5. **Error Handling**:
   - Disconnect internet
   - Reload page
   - Verify user-friendly error message is displayed

### API Testing

```bash
# Test API endpoint directly
curl http://localhost:3000/api/countries

# Expected response:
# {
#   "success": true,
#   "data": ["Afghanistan", "Albania", ...]
# }
```

## Troubleshooting

### Dropdown Not Populating

- **Check API**: Verify `/api/countries` returns data
- **Check Console**: Look for JavaScript errors in browser console
- **Check Network**: Verify REST Countries API is accessible

### Search Not Working

- **Verify Filtering**: Check `filterCountries` function in component
- **Check Case Sensitivity**: Ensure `toLowerCase()` is used for comparison
- **Check State Updates**: Verify `searchTerm` state updates on input

### Cache Not Working

- **Check Cache Utility**: Verify `lib/utils/cache.ts` is implemented correctly
- **Check TTL**: Verify cache TTL is set to 10 minutes (600,000ms)
- **Check Timestamp**: Verify timestamp is stored correctly

### Error Messages Not User-Friendly

- **Check Error Handling**: Verify try-catch blocks in API route
- **Check Error Messages**: Ensure messages are user-friendly (not technical)
- **Check Fallback**: Verify expired cache is returned when external API fails

## Next Steps

After implementation:

1. Test all user scenarios from the specification
2. Verify error handling works correctly
3. Check accessibility (keyboard navigation, screen readers)
4. Verify performance (response times meet success criteria)

## References

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [API Contracts](./contracts/api-routes.md)
- [Data Model](./data-model.md)
- [Research Findings](./research.md)

