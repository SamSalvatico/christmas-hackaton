# Quickstart Guide: Improve API Naming

**Date**: 2024-12-19  
**Feature**: Improve API Naming

## Overview

This guide provides step-by-step instructions for migrating from the old API endpoint naming (`/api/dishes`) to the new naming (`/api/cultural-data`). The refactoring improves API clarity by accurately reflecting that the endpoint returns comprehensive cultural data (dishes, Christmas carol, and Spotify URL), not just dishes.

---

## What Changed

### Endpoint Renaming

- **Old**: `/api/dishes`
- **New**: `/api/cultural-data`

### Type Renaming

- **Old**: `DishesApiRequest` → **New**: `CulturalDataApiRequest`
- **Old**: `CountryCulturalApiResponse` → **New**: `CulturalDataApiResponse`
- **Old**: `CountryCulturalApiSuccessResponse` → **New**: `CulturalDataApiSuccessResponse`
- **Old**: `CountryCulturalApiErrorResponse` → **New**: `CulturalDataApiErrorResponse`

### Function Renaming

- **Old**: `queryDishesAndCarolWithRetry` → **New**: `queryCulturalDataWithRetry`

### File Renaming

- **Old**: `app/api/dishes/route.ts` → **New**: `app/api/cultural-data/route.ts`
- **Old**: `lib/types/dishes.ts` → **New**: `lib/types/cultural-data.ts`

---

## Migration Steps

### Step 1: Create New Route File

1. Create new directory: `app/api/cultural-data/`
2. Create new route file: `app/api/cultural-data/route.ts`
3. Copy content from old route file
4. Update endpoint documentation comments

### Step 2: Rename Type File

1. Rename `lib/types/dishes.ts` to `lib/types/cultural-data.ts`
2. Update all type names within the file:
   - `DishesApiRequest` → `CulturalDataApiRequest`
   - `CountryCulturalApiResponse` → `CulturalDataApiResponse`
   - `CountryCulturalApiSuccessResponse` → `CulturalDataApiSuccessResponse`
   - `CountryCulturalApiErrorResponse` → `CulturalDataApiErrorResponse`

### Step 3: Update Type Exports

1. Update `lib/types/index.ts` to export from new file:
   ```typescript
   export * from './cultural-data';
   ```

### Step 4: Rename Service Function

1. In `lib/api/openai-service.ts`:
   - Rename `queryDishesAndCarolWithRetry` to `queryCulturalDataWithRetry`
   - Update function documentation comments

### Step 5: Update Route Handler

1. In `app/api/cultural-data/route.ts`:
   - Update imports to use new type names
   - Update function import to use new function name
   - Update comments and documentation

### Step 6: Update Frontend Code

1. In `app/page.tsx`:
   - Update endpoint URL from `/api/dishes` to `/api/cultural-data`
   - Update type imports to use new type names
   - Update type usage in code

### Step 7: Maintain Backward Compatibility

1. Keep old route file `app/api/dishes/route.ts`:
   - Import handler from new route file
   - Add deprecation notice in response
   - Or redirect to new endpoint

### Step 8: Update All Imports

1. Search for all imports of old types:
   ```bash
   grep -r "from '@/lib/types/dishes'" .
   ```
2. Update all imports to:
   ```typescript
   import type { ... } from '@/lib/types/cultural-data';
   ```

### Step 9: Verify TypeScript Compilation

1. Run TypeScript compiler:
   ```bash
   npm run build
   ```
2. Fix any compilation errors
3. Ensure all type references are updated

### Step 10: Verify Linting

1. Run linter:
   ```bash
   npm run lint
   ```
2. Fix any linting errors
3. Ensure code follows style guidelines

---

## Testing the Migration

### Test New Endpoint

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Test new endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/cultural-data \
     -H "Content-Type: application/json" \
     -d '{"country": "Italy"}'
   ```

3. **Verify response**:
   - Response should include `dishes`, `carol`, and `spotifyUrl` fields
   - Response structure should match old endpoint
   - Response should be successful

### Test Backward Compatibility

1. **Test old endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/dishes \
     -H "Content-Type: application/json" \
     -d '{"country": "Italy"}'
   ```

2. **Verify deprecation notice**:
   - Response should include deprecation headers or message
   - Response data should be same as new endpoint
   - Response should still work (not broken)

### Test Frontend Integration

1. **Open application** in browser: `http://localhost:3000`
2. **Select a country** from dropdown
3. **Click "Santa Search"** button
4. **Verify results**:
   - Cultural data displays correctly
   - Spotify URL displays if available
   - No errors in browser console
   - Network tab shows request to `/api/cultural-data`

---

## Verification Checklist

- [ ] New endpoint `/api/cultural-data` exists and works
- [ ] Old endpoint `/api/dishes` still works (backward compatibility)
- [ ] All type names updated consistently
- [ ] All function names updated consistently
- [ ] All imports updated to use new file paths
- [ ] Frontend code updated to use new endpoint
- [ ] TypeScript compilation passes without errors
- [ ] Linting passes without errors
- [ ] All comments and documentation updated
- [ ] Error messages use "cultural data" terminology
- [ ] Cache keys unchanged (already use "cultural-data")

---

## Rollback Plan

If issues occur during migration:

1. **Keep old endpoint active**: Don't remove old route file immediately
2. **Revert type changes**: Restore old type names if needed
3. **Revert function changes**: Restore old function names if needed
4. **Update frontend**: Revert frontend to use old endpoint if needed

**Note**: Since this is a refactoring (no functional changes), rollback should be straightforward by reverting file renames and type/function names.

---

## Common Issues

### Issue: TypeScript Compilation Errors

**Cause**: Type references not updated consistently.

**Solution**:
1. Search for all references to old type names
2. Update all references to new type names
3. Run `npm run build` to verify

### Issue: Import Path Errors

**Cause**: Import paths still reference old file name.

**Solution**:
1. Search for `@/lib/types/dishes` imports
2. Update to `@/lib/types/cultural-data`
3. Verify all imports are updated

### Issue: Frontend Not Updating

**Cause**: Frontend still calling old endpoint.

**Solution**:
1. Check `app/page.tsx` for endpoint URL
2. Update to `/api/cultural-data`
3. Clear browser cache and test

### Issue: Old Endpoint Broken

**Cause**: Old route file not maintained properly.

**Solution**:
1. Ensure old route file imports handler from new route
2. Or implement redirect/deprecation notice
3. Test old endpoint still works

---

## Next Steps

After migration:

1. **Monitor usage**: Check if old endpoint is still being used
2. **Update documentation**: Update API documentation with new endpoint name
3. **Plan deprecation**: Set sunset date for old endpoint (e.g., 1 month)
4. **Remove old endpoint**: After sunset date, remove old route file

---

## Support

For issues or questions:

1. Check TypeScript compilation errors
2. Review import paths and type references
3. Verify endpoint URLs in frontend code
4. Test both old and new endpoints

---

## Summary

This refactoring improves API naming clarity by:
- Renaming endpoint to accurately reflect returned data
- Updating types to use consistent "cultural data" terminology
- Maintaining backward compatibility during migration
- Improving code readability and maintainability

The migration is straightforward since it's a pure refactoring with no functional changes.

