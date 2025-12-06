# Research: Countries Searchable Dropdown

**Date**: 2024-12-19  
**Feature**: Countries Searchable Dropdown  
**Purpose**: Research Next.js 16 fetch patterns, in-memory caching, HeroUI dropdown components, and search filtering

## Technology Decisions

### Next.js 16 Native Fetch API

**Decision**: Use native `fetch` API (built into Next.js 16 and Node.js 24) for REST Countries API calls

**Rationale**:
- Next.js 16 recommends native `fetch` API for all data fetching
- Built into Node.js 18+ and Next.js, no additional dependencies required
- Automatic request deduplication in Next.js
- Supports caching with `next: { revalidate }` option
- Aligns with Next.js best practices and MCP recommendations
- TypeScript support with built-in `Request` and `Response` types

**Alternatives Considered**:
- **axios**: Additional dependency, not needed for simple GET requests
- **node-fetch**: Redundant with native fetch in Node.js 24
- **undici**: Lower-level, unnecessary complexity for this use case

**Sources**:
- [Next.js 16 Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
- [Next.js MCP DevTools](https://github.com/vercel/next.js/tree/canary/packages/next-devtools-mcp)

### In-Memory Cache with TTL

**Decision**: Implement in-memory cache using JavaScript `Map` with timestamp-based expiration (10 minutes TTL)

**Rationale**:
- Simple implementation for single-instance deployment (2-3 users)
- No external dependencies (Redis, etc.) required
- Fast access (O(1) lookup)
- Easy to implement TTL with timestamp comparison
- Suitable for small-scale deployment
- Aligns with project requirement for simplicity

**Implementation Pattern**:
```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }
  
  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
}
```

**Alternatives Considered**:
- **Next.js `unstable_cache`**: Server-side caching but doesn't support custom TTL easily
- **Redis**: Overkill for 2-3 users, adds infrastructure complexity
- **File-based cache**: Slower, unnecessary for in-memory data

**Sources**:
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
- [Node.js Map Documentation](https://nodejs.org/api/globals.html#map)

### HeroUI Select/Autocomplete Component

**Decision**: Use HeroUI `Select` or `Autocomplete` component for searchable dropdown

**Rationale**:
- HeroUI is already installed and configured in the project
- `Select` component supports search/filter functionality
- Built-in accessibility (ARIA support, keyboard navigation)
- TypeScript support out of the box
- Customizable styling and theming
- Aligns with User-Centric Design principle

**Component Choice**:
- **Select with `allowsCustomValue={false}`**: Standard dropdown with search
- **Autocomplete**: More advanced search with suggestions (may be overkill)
- **Decision**: Use `Select` component with `isSearchable` or similar prop for search functionality

**Implementation Pattern**:
```typescript
import { Select, SelectItem } from '@heroui/react';

<Select
  label="Select Country"
  placeholder="Search countries..."
  selectedKeys={selectedCountry ? [selectedCountry] : []}
  onSelectionChange={handleSelection}
  // Search/filter functionality built-in
>
  {filteredCountries.map((country) => (
    <SelectItem key={country} value={country}>
      {country}
    </SelectItem>
  ))}
</Select>
```

**Alternatives Considered**:
- **Custom dropdown**: More work, less accessible, reinventing the wheel
- **HTML `<select>`**: No built-in search, poor UX
- **React Select**: Additional dependency, HeroUI already available

**Sources**:
- [HeroUI Select Documentation](https://heroui.com/docs/components/select)
- [HeroUI Autocomplete Documentation](https://heroui.com/docs/components/autocomplete)

### Case-Insensitive Partial Matching (ILike)

**Decision**: Implement case-insensitive partial matching using JavaScript `String.prototype.includes()` with `toLowerCase()`

**Rationale**:
- Simple, performant implementation
- No regex overhead for simple substring matching
- Works well for country name search (typically <20 characters)
- Easy to understand and maintain
- Aligns with user expectation for search behavior

**Implementation Pattern**:
```typescript
function filterCountries(countries: string[], searchTerm: string): string[] {
  if (!searchTerm.trim()) return countries;
  const lowerSearch = searchTerm.toLowerCase();
  return countries.filter((country) =>
    country.toLowerCase().includes(lowerSearch)
  );
}
```

**Alternatives Considered**:
- **Regex matching**: More complex, unnecessary for simple substring search
- **Fuzzy matching**: Overkill for exact substring matching requirement
- **Database ILIKE**: Not applicable for in-memory filtering

**Sources**:
- [MDN String.prototype.includes()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes)

### Error Handling Strategy

**Decision**: Implement comprehensive error handling with user-friendly messages

**Rationale**:
- Aligns with User-Centric Design principle
- Provides clear feedback when REST Countries API fails
- Handles network errors, timeouts, and invalid responses
- Falls back to cached data when available
- Shows actionable error messages to users

**Error Scenarios**:
1. **REST Countries API unavailable**: Return cached data if available, otherwise show "Unable to load countries. Please try again later."
2. **Network timeout**: Show "Request timed out. Please try again."
3. **Invalid response format**: Show "Received invalid data. Please try again later."
4. **No cache available**: Show "Unable to load countries. Please refresh the page."

**Implementation Pattern**:
```typescript
try {
  const response = await fetch(REST_COUNTRIES_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  // Validate and process data
} catch (error) {
  // Check cache first
  const cached = cache.get('countries');
  if (cached) return cached;
  // Return user-friendly error
  throw new Error('Unable to load countries. Please try again later.');
}
```

**Sources**:
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [MDN Fetch API Error Handling](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#checking_that_the_fetch_was_successful)

## Best Practices Identified

### Next.js 16 API Routes

1. **Use Route Handlers**: Place API routes in `app/api/[route]/route.ts`
2. **Error Handling**: Always return proper HTTP status codes and error messages
3. **Type Safety**: Define TypeScript interfaces for request/response
4. **Caching**: Use in-memory cache for external API responses
5. **Timeout Handling**: Set reasonable timeouts for external API calls (5-10 seconds)

### HeroUI Component Usage

1. **Provider Setup**: Ensure `HeroUIProvider` is in root layout (already configured)
2. **Component Import**: Import from `@heroui/react` package
3. **Accessibility**: HeroUI components are accessible by default, maintain this
4. **Styling**: Use HeroUI's built-in styling, avoid custom CSS when possible
5. **State Management**: Use React state for selected country and search term

### Search Filtering

1. **Client-Side Filtering**: Filter countries array in component state
2. **Debouncing**: Not needed for small lists (~250 countries), but can be added if performance issues arise
3. **Case-Insensitive**: Always use `toLowerCase()` for comparison
4. **Empty State**: Show helpful message when no countries match search

### Caching Strategy

1. **TTL Management**: Store timestamp with cached data, check expiration on access
2. **Cache Key**: Use consistent key format (`'countries'`)
3. **Cache Invalidation**: Automatic on TTL expiration, manual clear if needed
4. **Error Fallback**: Return cached data even if expired when external API fails

## Dependencies

### Existing Dependencies (No New Dependencies Required)

- `next@^16.0.7`: Next.js framework (API routes, fetch)
- `react@^19.2.1`: React library
- `@heroui/react@^2.8.5`: HeroUI components (Select, Button)
- `typescript@^5.9.3`: TypeScript compiler

### No Additional Dependencies Needed

- Native `fetch` API (built into Node.js 24 and Next.js 16)
- JavaScript `Map` for in-memory cache (built-in)
- No external caching libraries required
- No additional UI libraries needed

## Configuration

### API Route Configuration

- **Endpoint**: `GET /api/countries`
- **Response Format**: `{ success: boolean, data?: string[], error?: { message: string } }`
- **Cache TTL**: 10 minutes (600,000 milliseconds)
- **Timeout**: 10 seconds for REST Countries API call

### REST Countries API

- **URL**: `https://restcountries.com/v3.1/all?fields=name`
- **Method**: GET
- **Authentication**: None required
- **Response**: Array of country objects with `name.common` field

## Open Questions Resolved

1. **Q: Which fetch library?** → A: Native `fetch` API (Next.js 16 recommended, MCP suggested)
2. **Q: How to implement caching?** → A: In-memory Map with TTL (simple, no dependencies)
3. **Q: Which HeroUI component?** → A: `Select` component with search functionality
4. **Q: How to implement ilike search?** → A: `toLowerCase().includes()` for case-insensitive partial matching
5. **Q: How to handle errors?** → A: Try-catch with user-friendly messages, fallback to cache
6. **Q: Where to place cache utility?** → A: `lib/utils/cache.ts` (reusable, modular)

## References

- [Next.js 16 Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [HeroUI Select Component](https://heroui.com/docs/components/select)
- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Map Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

