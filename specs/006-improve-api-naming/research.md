# Research: Improve API Naming

**Date**: 2024-12-19  
**Feature**: Improve API Naming

## Research Decisions

### Decision 1: New API Endpoint Name

**Decision**: Rename `/api/dishes` to `/api/cultural-data`.

**Rationale**: 
- "cultural-data" accurately describes the comprehensive data returned (dishes, carol, spotifyUrl)
- Uses kebab-case which is standard for REST API endpoints
- Clear and descriptive without being overly verbose
- Follows Next.js App Router conventions (directory-based routing)

**Alternatives Considered**:
- **`/api/country-cultural-data`**: Rejected because it's redundant (country is already in the request body)
- **`/api/culture`**: Rejected because it's too generic and doesn't indicate it's data about a country
- **`/api/country-data`**: Rejected because it's too generic (could include other country data in the future)
- **`/api/dishes-and-carol`**: Rejected because it's verbose and doesn't include spotifyUrl in the name

**Implementation Details**:
- Route file: `app/api/dishes/route.ts` → `app/api/cultural-data/route.ts`
- Endpoint URL: `/api/dishes` → `/api/cultural-data`
- Maintain old endpoint for backward compatibility (redirect or deprecation notice)

**References**:
- Next.js App Router routing: [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)
- REST API naming conventions: [RESTful API Design](https://restfulapi.net/resource-naming/)

---

### Decision 2: Type Naming Pattern

**Decision**: Rename types using pattern `CulturalDataApi*` (e.g., `CulturalDataApiRequest`, `CulturalDataApiResponse`).

**Rationale**:
- Consistent with existing naming pattern (`DishesApiRequest` → `CulturalDataApiRequest`)
- Clearly indicates these types are for the cultural data API
- Maintains consistency with other API types in the codebase
- TypeScript naming conventions (PascalCase for types)

**Alternatives Considered**:
- **`CountryCulturalDataApi*`**: Rejected because it's verbose and redundant (country is in request, not type name)
- **`CulturalApi*`**: Rejected because it's ambiguous (could be any cultural API)
- **`ApiCulturalData*`**: Rejected because it doesn't follow existing pattern (Api prefix should be suffix)

**Implementation Details**:
- `DishesApiRequest` → `CulturalDataApiRequest`
- `DishesApiResponse` → `CulturalDataApiResponse` (legacy, may be removed)
- `CountryCulturalApiResponse` → `CulturalDataApiResponse` (already uses cultural, just needs consistency)
- `DishesApiSuccessResponse` → `CulturalDataApiSuccessResponse` (if still needed)
- `DishesApiErrorResponse` → `CulturalDataApiErrorResponse`
- `CountryCulturalApiSuccessResponse` → `CulturalDataApiSuccessResponse`
- `CountryCulturalApiErrorResponse` → `CulturalDataApiErrorResponse`

**References**:
- TypeScript naming conventions: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

### Decision 3: Function Naming Pattern

**Decision**: Rename functions to use "cultural data" terminology instead of "dishes and carol".

**Rationale**:
- Function names should reflect what they do, not implementation details
- "cultural data" is more accurate than "dishes and carol" (also includes spotifyUrl)
- Shorter and clearer than "dishesAndCarol"
- Consistent with API endpoint naming

**Alternatives Considered**:
- **`queryCountryCulturalData`**: Rejected because it's verbose (country is a parameter, not part of function name)
- **`fetchCulturalData`**: Rejected because "fetch" implies network call, but function does more (querying, parsing, validation)
- **`getCulturalData`**: Rejected because "get" implies simple retrieval, but function includes retry logic

**Implementation Details**:
- `queryDishesAndCarolWithRetry` → `queryCulturalDataWithRetry`
- Internal functions can keep descriptive names (e.g., `buildCombinedPrompt` is fine as it describes implementation)
- Variable names: `culturalData` (already used in some places, should be consistent everywhere)

**References**:
- Function naming best practices: [Clean Code - Naming](https://github.com/ryanmcdermott/clean-code-javascript#use-meaningful-and-pronounceable-variable-names)

---

### Decision 4: File Naming Strategy

**Decision**: Rename type file from `lib/types/dishes.ts` to `lib/types/cultural-data.ts` OR keep file name and rename types within.

**Rationale**:
- File name should reflect its primary purpose
- Since file contains types for cultural data (not just dishes), renaming makes sense
- However, file also contains `Dish` and `DishesResponse` types which are still valid (they're part of cultural data)
- Alternative: Keep file name as `dishes.ts` but rename API-related types

**Alternatives Considered**:
- **Rename file to `cultural-data.ts`**: 
  - Pros: File name matches API purpose
  - Cons: File still contains `Dish` and `DishesResponse` types (not just cultural data types)
- **Keep file as `dishes.ts`, rename types within**:
  - Pros: File name still accurate (contains dish-related types)
  - Cons: Less clear that it also contains cultural data API types
- **Split into two files**: 
  - Rejected because it's over-engineering for a simple refactoring

**Implementation Details**:
- **Chosen approach**: Rename file to `lib/types/cultural-data.ts`
- File contains both dish-related types (`Dish`, `DishesResponse`) and cultural data types (`CountryCulturalData`, `CulturalDataApiRequest`, etc.)
- This is acceptable because dishes are part of cultural data
- Update all imports from `@/lib/types/dishes` to `@/lib/types/cultural-data`

**References**:
- File organization best practices: [TypeScript Project Structure](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html)

---

### Decision 5: Backward Compatibility Strategy

**Decision**: Maintain old endpoint `/api/dishes` with a redirect to new endpoint `/api/cultural-data` OR return deprecation notice.

**Rationale**:
- Prevents breaking changes for any existing integrations
- Provides clear migration path for API consumers
- Follows REST API versioning best practices
- Allows gradual migration

**Alternatives Considered**:
- **Remove old endpoint immediately**: 
  - Rejected because it breaks backward compatibility
- **Keep both endpoints indefinitely**: 
  - Rejected because it creates maintenance burden and confusion
- **Redirect old endpoint to new**: 
  - Pros: Seamless migration, no breaking changes
  - Cons: Requires maintaining old route file
- **Return deprecation notice on old endpoint**: 
  - Pros: Clear migration path, can remove later
  - Cons: Requires clients to update code

**Implementation Details**:
- **Chosen approach**: Keep old endpoint `/api/dishes` that internally calls the new endpoint handler
- Old route file can import and reuse the new route handler
- OR: Old route returns 301 redirect to new endpoint (if Next.js supports it)
- OR: Old route returns deprecation warning in response headers or body
- **Recommended**: Keep old route file that calls same handler, add deprecation notice in response

**References**:
- API versioning and deprecation: [API Versioning Best Practices](https://www.baeldung.com/rest-versioning)

---

### Decision 6: Comment and Documentation Updates

**Decision**: Update all comments, JSDoc, and inline documentation to use "cultural data" terminology consistently.

**Rationale**:
- Comments should accurately describe what code does
- Documentation should match code naming
- Consistency improves code readability and maintainability
- Reduces confusion for developers reading the code

**Alternatives Considered**:
- **Leave comments as-is**: 
  - Rejected because it creates inconsistency and confusion
- **Update only API-related comments**: 
  - Rejected because all comments should be accurate

**Implementation Details**:
- Update JSDoc comments in route handler
- Update function documentation in openai-service.ts
- Update inline comments that mention "dishes" when they mean "cultural data"
- Update error messages to use "cultural data" terminology
- Keep comments about dish-specific logic accurate (e.g., "dish categories" is fine)

**References**:
- Documentation best practices: [JSDoc Guidelines](https://jsdoc.app/about-getting-started.html)

---

## Technical Constraints

1. **TypeScript Compilation**: 
   - All type references must be updated atomically to avoid compilation errors
   - TypeScript strict mode will catch any missed references

2. **Next.js Routing**: 
   - Route files must be in correct directory structure
   - Old route can coexist with new route

3. **Import Paths**: 
   - All import statements must be updated
   - Path aliases (`@/lib/types/...`) must be updated

4. **Cache Keys**: 
   - Cache keys use "cultural-data" already, no changes needed

5. **Frontend Integration**: 
   - Frontend code must be updated to use new endpoint
   - Type imports must be updated

## Dependencies

- **Next.js App Router**: Route file structure
- **TypeScript**: Type system and compilation
- **Existing Codebase**: All files that import or reference old names

## Open Questions Resolved

- ✅ New endpoint name: `/api/cultural-data`
- ✅ Type naming pattern: `CulturalDataApi*`
- ✅ Function naming: `queryCulturalDataWithRetry`
- ✅ File naming: `lib/types/cultural-data.ts`
- ✅ Backward compatibility: Keep old endpoint with deprecation notice
- ✅ Documentation updates: All comments and docs updated

