# Data Model: Improve API Naming

**Date**: 2024-12-19  
**Feature**: Improve API Naming

## Entities

### Cultural Data API Endpoint

Represents the renamed API endpoint that returns comprehensive cultural data for a country.

**Attributes**:
- `path` (string): API endpoint path
  - **Type**: `string`
  - **Required**: Yes
  - **Old Value**: `/api/dishes`
  - **New Value**: `/api/cultural-data`
  - **Validation**: Must be valid URL path
- `method` (string): HTTP method
  - **Type**: `string`
  - **Required**: Yes
  - **Value**: `POST`
  - **Validation**: Must be valid HTTP method
- `request` (CulturalDataApiRequest): Request structure
  - **Type**: `CulturalDataApiRequest`
  - **Required**: Yes
  - **Old Type**: `DishesApiRequest`
- `response` (CulturalDataApiResponse): Response structure
  - **Type**: `CulturalDataApiResponse`
  - **Required**: Yes
  - **Old Type**: `CountryCulturalApiResponse` (already uses cultural, just needs consistency)

**Source**: Next.js App Router route file

**Usage**: 
- Primary API endpoint for retrieving cultural data
- Replaces old `/api/dishes` endpoint

---

### Cultural Data API Types

Represents the renamed TypeScript types for the cultural data API.

**Attributes**:
- `requestType` (CulturalDataApiRequest): Request type
  - **Type**: `CulturalDataApiRequest`
  - **Required**: Yes
  - **Old Type**: `DishesApiRequest`
  - **Fields**: `{ country: string }`
- `responseType` (CulturalDataApiResponse): Response union type
  - **Type**: `CulturalDataApiResponse`
  - **Required**: Yes
  - **Old Type**: `CountryCulturalApiResponse`
  - **Variants**: `CulturalDataApiSuccessResponse | CulturalDataApiErrorResponse`
- `successResponseType` (CulturalDataApiSuccessResponse): Success response type
  - **Type**: `CulturalDataApiSuccessResponse`
  - **Required**: Yes
  - **Old Type**: `CountryCulturalApiSuccessResponse`
  - **Fields**: `{ success: true, data: CountryCulturalData }`
- `errorResponseType` (CulturalDataApiErrorResponse): Error response type
  - **Type**: `CulturalDataApiErrorResponse`
  - **Required**: Yes
  - **Old Type**: `CountryCulturalApiErrorResponse`
  - **Fields**: `{ success: false, error: { message: string } }`

**Source**: TypeScript type definitions in `lib/types/cultural-data.ts`

**Usage**: 
- Type-safe API request/response handling
- TypeScript compilation and IDE support

---

### Cultural Data Service Functions

Represents renamed service functions that query and process cultural data.

**Attributes**:
- `queryFunction` (queryCulturalDataWithRetry): Main query function
  - **Type**: `function`
  - **Required**: Yes
  - **Old Name**: `queryDishesAndCarolWithRetry`
  - **Parameters**: `countryName: string`
  - **Returns**: `Promise<CountryCulturalData>`
  - **Purpose**: Query OpenAI for cultural data with retry logic

**Source**: Service functions in `lib/api/openai-service.ts`

**Usage**: 
- Called by API route handler
- Handles OpenAI API integration
- Implements retry and validation logic

---

## Request/Response Structures

### POST /api/cultural-data Request

**Method**: `POST`  
**Path**: `/api/cultural-data`  
**Query Parameters**: None  
**Headers**: 
- `Content-Type: application/json`
- Standard Next.js request headers

**Request Body**:
```typescript
{
  country: string; // Country name
}
```

**Request Body Schema**:
```typescript
interface CulturalDataApiRequest {
  country: string; // Required, non-empty string
}
```

**Validation Rules**:
- `country` must be present
- `country` must be a non-empty string after trimming

**Old Request Type**: `DishesApiRequest` (same structure, renamed)

---

### POST /api/cultural-data Response

**Response** (Success):
```typescript
{
  success: true;
  data: {
    dishes: DishesResponse;
    carol: ChristmasCarol | null;
    spotifyUrl: string | null;
  };
}
```

**Response Schema**:
```typescript
interface CulturalDataApiSuccessResponse {
  success: true;
  data: CountryCulturalData;
}
```

**Response** (Error):
```typescript
{
  success: false;
  error: {
    message: string;
  };
}
```

**Response Schema**:
```typescript
interface CulturalDataApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}
```

**Old Response Types**: 
- `CountryCulturalApiSuccessResponse` → `CulturalDataApiSuccessResponse`
- `CountryCulturalApiErrorResponse` → `CulturalDataApiErrorResponse`
- `CountryCulturalApiResponse` → `CulturalDataApiResponse`

---

## Type Renaming Map

### API Types

| Old Name | New Name | Location |
|----------|----------|----------|
| `DishesApiRequest` | `CulturalDataApiRequest` | `lib/types/cultural-data.ts` |
| `DishesApiResponse` | `CulturalDataApiResponse` | `lib/types/cultural-data.ts` (legacy, may be removed) |
| `DishesApiSuccessResponse` | `CulturalDataApiSuccessResponse` | `lib/types/cultural-data.ts` (legacy, may be removed) |
| `DishesApiErrorResponse` | `CulturalDataApiErrorResponse` | `lib/types/cultural-data.ts` |
| `CountryCulturalApiResponse` | `CulturalDataApiResponse` | `lib/types/cultural-data.ts` |
| `CountryCulturalApiSuccessResponse` | `CulturalDataApiSuccessResponse` | `lib/types/cultural-data.ts` |
| `CountryCulturalApiErrorResponse` | `CulturalDataApiErrorResponse` | `lib/types/cultural-data.ts` |

### Data Types (No Changes)

| Name | Status | Location |
|------|--------|----------|
| `Dish` | Keep as-is | `lib/types/cultural-data.ts` |
| `DishesResponse` | Keep as-is | `lib/types/cultural-data.ts` |
| `ChristmasCarol` | Keep as-is | `lib/types/cultural-data.ts` |
| `CountryCulturalData` | Keep as-is | `lib/types/cultural-data.ts` |

**Rationale**: Data types (`Dish`, `DishesResponse`, etc.) are still accurate - they represent dish data which is part of cultural data. Only API-related types need renaming.

---

## Function Renaming Map

### Service Functions

| Old Name | New Name | Location |
|----------|----------|----------|
| `queryDishesAndCarolWithRetry` | `queryCulturalDataWithRetry` | `lib/api/openai-service.ts` |

### Internal Functions (No Changes)

| Name | Status | Location |
|------|--------|----------|
| `buildCombinedPrompt` | Keep as-is | `lib/api/openai-service.ts` |
| `buildRefinedCombinedPrompt` | Keep as-is | `lib/api/openai-service.ts` |
| `queryDishesAndCarolForCountry` | Keep as-is (internal) | `lib/api/openai-service.ts` |
| `parseCombinedResponse` | Keep as-is | `lib/api/openai-service.ts` |
| `validateCombinedData` | Keep as-is | `lib/api/openai-service.ts` |

**Rationale**: Internal functions with descriptive names (e.g., "buildCombinedPrompt") are fine as-is. Only exported/public functions need renaming for consistency.

---

## File Renaming Map

### Route Files

| Old Path | New Path | Action |
|----------|----------|--------|
| `app/api/dishes/route.ts` | `app/api/cultural-data/route.ts` | Move and rename |

### Type Files

| Old Path | New Path | Action |
|----------|----------|--------|
| `lib/types/dishes.ts` | `lib/types/cultural-data.ts` | Rename file |

### Service Files (No Changes)

| Path | Status |
|------|--------|
| `lib/api/openai-service.ts` | Keep as-is (contains multiple functions) |
| `lib/api/spotify-service.ts` | Keep as-is (unrelated to dishes) |
| `lib/utils/cache.ts` | Keep as-is (generic utility) |

---

## Import Path Updates

### Type Imports

**Old**:
```typescript
import type {
  DishesApiRequest,
  CountryCulturalApiResponse,
  CountryCulturalData,
} from '@/lib/types/dishes';
```

**New**:
```typescript
import type {
  CulturalDataApiRequest,
  CulturalDataApiResponse,
  CountryCulturalData,
} from '@/lib/types/cultural-data';
```

### Function Imports

**Old**:
```typescript
import { queryDishesAndCarolWithRetry } from '@/lib/api/openai-service';
```

**New**:
```typescript
import { queryCulturalDataWithRetry } from '@/lib/api/openai-service';
```

---

## Validation Rules

### Endpoint Path Validation

- Must be valid URL path format
- Must use kebab-case
- Must start with `/api/`
- Must not contain special characters

### Type Name Validation

- Must use PascalCase
- Must follow pattern `CulturalDataApi*` for API types
- Must be unique within namespace
- Must not conflict with existing types

### Function Name Validation

- Must use camelCase
- Must be descriptive and accurate
- Must not conflict with existing functions
- Exported functions should use "cultural data" terminology

---

## State Transitions

### Migration Flow

1. **Initial State**: Old endpoint `/api/dishes` active, old types in use
2. **Create New Endpoint**: New route file `app/api/cultural-data/route.ts` created
3. **Rename Types**: Types renamed in type file
4. **Rename Functions**: Service functions renamed
5. **Update Imports**: All imports updated to use new names
6. **Update Frontend**: Frontend code updated to use new endpoint
7. **Test New Endpoint**: Verify new endpoint works correctly
8. **Maintain Old Endpoint**: Old endpoint redirects or shows deprecation notice
9. **Final State**: New endpoint active, old endpoint deprecated

---

## Backward Compatibility

### Old Endpoint Handling

**Option 1: Redirect** (Recommended)
- Old endpoint `/api/dishes` returns 301 redirect to `/api/cultural-data`
- Seamless for clients, no code changes needed

**Option 2: Deprecation Notice**
- Old endpoint `/api/dishes` still works but returns deprecation warning
- Response includes `X-API-Deprecated: true` header
- Response body includes deprecation message

**Option 3: Shared Handler**
- Old route file imports handler from new route file
- Both endpoints use same implementation
- Old endpoint can add deprecation notice

**Chosen**: Option 3 (Shared Handler) - Maintains functionality while allowing deprecation notice

