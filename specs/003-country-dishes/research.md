# Research: Country Famous Dishes with OpenAI Integration

**Date**: 2024-12-19  
**Feature**: Country Famous Dishes  
**Purpose**: Research OpenAI SDK integration, prompt engineering, response parsing, and caching strategies

## Technology Decisions

### OpenAI SDK for Node.js/TypeScript

**Decision**: Use official OpenAI SDK (`openai` package) for Node.js/TypeScript

**Rationale**:
- Official SDK provides type-safe integration with OpenAI API
- Handles authentication, request formatting, and error handling
- Built-in support for streaming and structured outputs
- Well-maintained and actively developed
- TypeScript support out of the box
- Aligns with user requirement to use OpenAI SDK

**Installation**:
```bash
npm install openai
```

**Usage Pattern**:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: prompt }],
  response_format: { type: 'json_object' },
});
```

**Alternatives Considered**:
- **Direct fetch API**: More manual work, no type safety, reinventing the wheel
- **Other LLM SDKs**: OpenAI SDK is the official solution, best support

**Sources**:
- [OpenAI Node.js SDK Documentation](https://github.com/openai/openai-node)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

### Environment Variable Configuration

**Decision**: Store OpenAI API key in `.env.local` file (Next.js standard)

**Rationale**:
- Next.js automatically loads `.env.local` in development
- Environment variables are secure (not committed to git)
- Standard practice for API keys and secrets
- Easy to configure per environment

**Configuration**:
```bash
# .env.local
OPENAI_API_KEY=sk-...
```

**Access Pattern**:
```typescript
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}
```

**Alternatives Considered**:
- **Config file**: Less secure, harder to manage per environment
- **Hardcoded**: Security risk, not acceptable

**Sources**:
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

### Structured Prompt with JSON Format

**Decision**: Use structured prompt with explicit JSON format requirements and response_format parameter

**Rationale**:
- Ensures consistent, parseable responses from OpenAI
- Reduces need for complex parsing logic
- Makes retry logic simpler (can validate JSON structure)
- Aligns with user requirement for meaningful, specific queries

**Prompt Structure**:
```typescript
const prompt = `For the country "${countryName}", provide the most famous dishes in JSON format.
Return exactly one dish for each category (entry/appetizer, main course, dessert) if available.
For each dish, include:
- name: string (dish name)
- description: string (brief 1-3 sentence description)
- ingredients: string[] (list of main ingredients)

Format the response as a JSON object with this structure:
{
  "entry": { "name": "...", "description": "...", "ingredients": [...] } | null,
  "main": { "name": "...", "description": "...", "ingredients": [...] } | null,
  "dessert": { "name": "...", "description": "...", "ingredients": [...] } | null
}

If a category has no famous dishes, set it to null. Only include categories that have dishes.`;
```

**Response Format Configuration**:
```typescript
response_format: { type: 'json_object' }
```

**Alternatives Considered**:
- **Free-form text**: Harder to parse, inconsistent format
- **XML format**: Less common, more verbose
- **CSV format**: Not suitable for nested data

**Sources**:
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [OpenAI JSON Mode](https://platform.openai.com/docs/guides/text-generation/json-mode)

### In-Memory Cache for Valid Responses Only

**Decision**: Cache only valid, successfully parsed dish responses for 20 minutes per country

**Rationale**:
- Reduces OpenAI API calls and costs
- Improves response time for repeated queries
- Only caching valid responses ensures data quality
- 20-minute TTL balances freshness with performance
- Reuses existing cache utility from feature 002

**Cache Key Pattern**:
```typescript
const cacheKey = `dishes:${countryName}`;
```

**Validation Before Caching**:
```typescript
if (isValidDishResponse(parsedResponse)) {
  cache.set(cacheKey, parsedResponse, CACHE_TTL);
}
```

**Cache TTL**: 20 minutes (1,200,000 milliseconds)

**Alternatives Considered**:
- **No caching**: Higher API costs, slower responses
- **Cache all responses**: Risk of caching invalid data
- **Longer TTL**: Stale data, less fresh information
- **Shorter TTL**: More API calls, higher costs

**Sources**:
- Existing cache utility from feature 002 (`lib/utils/cache.ts`)

### Automatic Retry with Refined Query

**Decision**: Automatically retry OpenAI query with refined prompt when response is invalid or malformed

**Rationale**:
- Improves success rate without user intervention
- Refined query can help OpenAI understand requirements better
- Handles transient parsing issues
- Aligns with user requirement for retry logic

**Retry Strategy**:
1. First attempt: Standard prompt
2. If invalid/malformed: Retry with refined prompt (more explicit format requirements)
3. Maximum 2 attempts to avoid infinite loops

**Refined Prompt Pattern**:
```typescript
const refinedPrompt = `${originalPrompt}

IMPORTANT: You must respond with valid JSON only. Ensure:
- All required fields (name, description, ingredients) are present
- Ingredients is an array of strings
- JSON is properly formatted and parseable
- Categories without dishes are set to null`;
```

**Alternatives Considered**:
- **No retry**: Lower success rate, more user frustration
- **Multiple retries**: Risk of infinite loops, higher costs
- **User-initiated retry**: Poor UX, requires user action

**Sources**:
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)

### Simple JSON Display

**Decision**: Display raw JSON content on page after Santa Search button click and LLM response

**Rationale**:
- Simple implementation as per user requirement
- Easy to verify response structure
- Can be enhanced later with formatted UI
- Keeps code simple and straightforward

**Display Pattern**:
```typescript
<pre>{JSON.stringify(dishesData, null, 2)}</pre>
```

**Alternatives Considered**:
- **Formatted UI components**: More complex, not required initially
- **Table display**: More work, JSON is sufficient for now

**Sources**:
- User requirement: "At the moment just print a json content in the page"

### Error Handling Strategy

**Decision**: Implement comprehensive error handling with user-friendly messages

**Rationale**:
- Aligns with User-Centric Design principle
- Provides clear feedback when OpenAI API fails
- Handles rate limits, timeouts, and invalid responses
- Shows actionable error messages to users

**Error Scenarios**:
1. **No dishes found**: "No famous dishes found for [country]. Please try another country."
2. **Rate limited**: "Service is temporarily unavailable. Please try again in a moment."
3. **Invalid response**: Automatic retry with refined query
4. **Service unavailable**: "Unable to connect to dish service. Please try again later."
5. **API key missing**: "Service configuration error. Please contact support."

**Implementation Pattern**:
```typescript
try {
  const dishes = await queryDishesForCountry(country);
  // Display dishes
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    showError('Service is temporarily unavailable. Please try again in a moment.');
  } else {
    showError('Unable to find dishes for this country. Please try again.');
  }
}
```

**Sources**:
- [OpenAI Error Handling](https://platform.openai.com/docs/guides/error-codes)
- Existing error handling patterns from feature 001

## Best Practices Identified

### OpenAI SDK Integration

1. **API Key Management**: Always use environment variables, never hardcode
2. **Error Handling**: Handle rate limits, timeouts, and API errors gracefully
3. **Structured Outputs**: Use `response_format: { type: 'json_object' }` for JSON responses
4. **Prompt Engineering**: Be specific about format requirements in prompts
5. **Cost Control**: Cache responses to reduce API calls
6. **Type Safety**: Use TypeScript types for OpenAI responses

### Prompt Engineering

1. **Be Specific**: Clearly state what format you want (JSON structure)
2. **Provide Examples**: Include example structure in prompt when helpful
3. **Handle Edge Cases**: Explicitly state what to do when data is missing (null values)
4. **Validate Requirements**: Request specific fields and data types

### Caching Strategy

1. **Validate Before Caching**: Only cache valid, parseable responses
2. **Cache Key Design**: Use country name as part of cache key
3. **TTL Management**: Set appropriate TTL based on data freshness needs
4. **Cache Invalidation**: Automatic expiration based on TTL

### Response Parsing

1. **JSON Validation**: Validate JSON structure before parsing
2. **Type Checking**: Verify required fields exist and have correct types
3. **Error Recovery**: Retry with refined query on parsing failures
4. **Null Handling**: Handle null categories gracefully

## Dependencies

### New Dependencies

- `openai@^4.x`: Official OpenAI SDK for Node.js/TypeScript

### Existing Dependencies (Reused)

- `next@^16.0.7`: Next.js framework
- `react@^19.2.1`: React library
- `typescript@^5.9.3`: TypeScript compiler
- Existing cache utility from feature 002

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: OpenAI API key (required, from `.env.local`)

### API Configuration

- **Model**: `gpt-4` or `gpt-3.5-turbo` (configurable)
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Max Tokens**: 1000 (sufficient for dish information)
- **Response Format**: JSON object
- **Timeout**: 30 seconds

## Open Questions Resolved

1. **Q: Which LLM SDK?** → A: OpenAI SDK (official, type-safe)
2. **Q: How to structure prompts?** → A: Explicit JSON format with structured requirements
3. **Q: How to cache?** → A: In-memory cache, 20 minutes TTL, valid responses only
4. **Q: How to handle invalid responses?** → A: Automatic retry with refined query
5. **Q: How to display results?** → A: Simple JSON display on page (can be enhanced later)
6. **Q: How to manage API key?** → A: Environment variable in `.env.local`

## References

- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [OpenAI JSON Mode](https://platform.openai.com/docs/guides/text-generation/json-mode)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [OpenAI Error Handling](https://platform.openai.com/docs/guides/error-codes)

