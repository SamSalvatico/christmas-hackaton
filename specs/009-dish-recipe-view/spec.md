# Feature Specification: Dish Recipe Viewing

**Feature Branch**: `009-dish-recipe-view`  
**Created**: 2024-12-19  
**Status**: Draft  
**Input**: User description: "I need to add the possibility to see the recipe for each dish shown. Once the user search for dishes and they have loaded, make the dish name clickable and, when hover, see a label 'View the recipe'. when it's clicked we need to, show the santa loader, invoke the model already selected asking it to search for the recipe splitting it in multiple steps for that dish, indicating the country we are searching for. then, we need to cache the recipe using the dish name, the country name, the search mode, so to reuse that value once the user searches for the recipe again. then, show the result into a modal"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Recipe for a Dish (Priority: P1)

A user has searched for Christmas dishes from a country and sees the dish cards displayed. They want to see the recipe for a specific dish. They hover over the dish name and see a "View the recipe" label, indicating the dish name is clickable. When they click on the dish name, the system shows a loading indicator, retrieves the recipe (or uses cached recipe if available), and displays it in a modal dialog with step-by-step instructions.

**Why this priority**: This is the core functionality of the feature. Without the ability to view recipes, users cannot access the detailed cooking instructions they need. The clickable dish name with hover feedback provides clear affordance for this action.

**Independent Test**: Can be fully tested by searching for dishes, hovering over a dish name to see "View the recipe" label, clicking the dish name, and verifying that a modal appears with the recipe displayed in step-by-step format. The test delivers a clear, accessible way for users to view recipe details.

**Acceptance Scenarios**:

1. **Given** a user has searched for dishes and sees dish cards displayed, **When** they hover over a dish name, **Then** they see a "View the recipe" label indicating the name is clickable
2. **Given** a user hovers over a dish name, **When** they move their cursor away, **Then** the "View the recipe" label disappears
3. **Given** a user clicks on a dish name, **When** the system processes the request, **Then** a loading indicator (Santa loader) is displayed
4. **Given** a user clicks on a dish name, **When** the recipe is retrieved (from cache or generated), **Then** a modal dialog appears displaying the recipe
5. **Given** a recipe is displayed in the modal, **When** the user views it, **Then** the recipe is formatted as step-by-step instructions
6. **Given** a recipe modal is open, **When** the user clicks outside the modal or closes it, **Then** the modal is dismissed and they return to the dish cards view

---

### User Story 2 - Recipe Generation with Selected Search Mode (Priority: P1)

A user clicks on a dish name to view its recipe. The system uses the currently selected search mode (fast or detailed) to generate the recipe. The recipe request includes the dish name and country name to ensure accurate, contextually appropriate recipe generation. The recipe is formatted as multiple steps for clear cooking instructions.

**Why this priority**: This ensures consistency with the user's mode selection and provides appropriate recipe detail level. Using the selected mode maintains user expectations about response speed and detail level.

**Independent Test**: Can be fully tested by selecting a search mode, searching for dishes, clicking on a dish name, and verifying that the recipe generation uses the selected mode and includes dish name and country in the request. The test delivers recipe generation that respects user preferences and provides contextual information.

**Acceptance Scenarios**:

1. **Given** a user has selected "Fast search" mode and clicked on a dish name, **When** the system generates the recipe, **Then** it uses the fast mode for recipe generation (same model as fast search mode)
2. **Given** a user has selected "Detective Santa" mode and clicked on a dish name, **When** the system generates the recipe, **Then** it uses the detailed mode for recipe generation (same model as detailed search mode)
3. **Given** a recipe is being generated, **When** the system processes the request, **Then** the recipe request includes the dish name and country name
4. **Given** a recipe is generated, **When** it is displayed, **Then** it is formatted as multiple sequential steps for cooking instructions
5. **Given** a recipe is generated in fast mode, **When** it is displayed, **Then** it contains concise but clear step-by-step instructions
6. **Given** a recipe is generated in detailed mode, **When** it is displayed, **Then** it contains comprehensive step-by-step instructions with additional context (cooking tips, timing, temperature details)

---

### User Story 3 - Recipe Caching for Performance (Priority: P1)

A user clicks on a dish name to view its recipe. The system checks if a cached recipe exists for that dish, country, and search mode combination. If cached, the recipe is displayed immediately without generating a new one. If not cached, the recipe is generated and then cached for future use. Subsequent requests for the same dish, country, and mode combination return the cached recipe instantly.

**Why this priority**: Caching improves performance and reduces API costs. Users expect fast responses when viewing recipes they've already accessed. The cache key must include dish name, country, and mode to ensure correct recipe retrieval.

**Independent Test**: Can be fully tested by clicking on a dish name to generate a recipe, then clicking on the same dish name again, and verifying that the second request returns the cached recipe immediately without showing the loading indicator for an extended period. The test delivers fast, cached recipe retrieval that improves user experience.

**Acceptance Scenarios**:

1. **Given** a user clicks on a dish name for the first time, **When** the recipe is generated, **Then** it is cached using a key that includes dish name, country name, and search mode
2. **Given** a recipe has been cached for a dish, country, and mode combination, **When** the user clicks on the same dish name again (same country and mode), **Then** the cached recipe is returned immediately
3. **Given** a user views a recipe in fast mode, **When** they switch to detailed mode and click on the same dish name, **Then** a new recipe is generated (not the cached fast mode recipe)
4. **Given** a user views a recipe for a dish from one country, **When** they search for the same dish name from a different country, **Then** a new recipe is generated (not the cached recipe from the first country)
5. **Given** a cached recipe exists, **When** the cache expires (after TTL period), **Then** a new recipe is generated on the next request

---

### Edge Cases

- What happens when a user clicks on a dish name while a recipe modal is already open? The existing modal should close and a new one should open for the newly selected dish
- How does the system handle recipe generation failures? The modal should display a user-friendly error message, and the user should be able to retry or close the modal
- What happens if the dish name contains special characters? The cache key should handle special characters appropriately to ensure correct caching
- How does the system handle very long recipe responses? The modal should display the full recipe with appropriate scrolling
- What happens when a user switches search modes between viewing recipes? Each mode should maintain its own cached recipes independently
- How does the system handle network errors during recipe generation? The user should see an error message with the option to retry
- What happens if the recipe generation takes a very long time? The loading indicator should remain visible and provide appropriate feedback
- How does the system handle recipe requests for dishes that might not have traditional recipes? The system should handle this gracefully, either generating a recipe based on the dish description or showing an appropriate message

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST make dish names clickable in dish cards when dishes are displayed
- **FR-002**: System MUST display "View the recipe" label when user hovers over a dish name
- **FR-003**: System MUST hide "View the recipe" label when user moves cursor away from dish name
- **FR-004**: System MUST show a loading indicator (Santa loader) when user clicks on a dish name and recipe is being retrieved
- **FR-005**: System MUST use the currently selected search mode (fast or detailed) when generating recipes
- **FR-006**: System MUST include dish name and country name in the recipe generation request
- **FR-007**: System MUST format recipes as multiple sequential steps for cooking instructions
- **FR-008**: System MUST cache recipes using a cache key that includes dish name, country name, and search mode
- **FR-009**: System MUST return cached recipes immediately when available for the same dish, country, and mode combination
- **FR-010**: System MUST generate new recipes when cache is expired or unavailable
- **FR-011**: System MUST display recipes in a modal dialog
- **FR-012**: System MUST allow users to close the modal by clicking outside it or using a close button
- **FR-013**: System MUST handle recipe generation errors gracefully with user-friendly error messages
- **FR-014**: System MUST allow users to retry recipe generation if it fails
- **FR-015**: System MUST maintain separate cached recipes for fast and detailed modes for the same dish and country
- **FR-016**: System MUST maintain separate cached recipes for the same dish from different countries

### Key Entities *(include if feature involves data)*

- **Recipe**: Represents step-by-step cooking instructions for a dish, generated based on dish name, country, and search mode
- **Recipe Cache Key**: Represents the unique identifier used to store and retrieve cached recipes, which must include dish name, country name, and search mode to ensure independent caching
- **Cached Recipe**: Represents stored recipe data for a specific dish, country, and mode combination, with associated expiration timestamp
- **Recipe Modal**: Represents the user interface component that displays recipe information in a dialog overlay

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view recipes for dishes by clicking on dish names, with 100% of displayed dish names being clickable
- **SC-002**: "View the recipe" label appears on hover within 200ms, providing clear affordance for clickable dish names
- **SC-003**: Cached recipes are returned within 100ms (near-instant response from cache)
- **SC-004**: Recipe generation uses the selected search mode 100% of the time (no mode mismatch)
- **SC-005**: Cache hit rate for repeated recipe requests is at least 80% when requests occur within the cache TTL period
- **SC-006**: Recipes are formatted as step-by-step instructions, with 100% of displayed recipes containing multiple sequential steps
- **SC-007**: Recipe modal displays successfully for 95% of recipe requests (excluding network/API failures)
- **SC-008**: Users can close the recipe modal and return to dish cards view, with modal dismissal working 100% of the time
- **SC-009**: Recipe cache maintains independent entries per dish, country, and mode combination, with zero instances of cross-contamination

## Assumptions

- The existing search mode selection (fast/detailed) will be used for recipe generation
- The existing cache mechanism supports custom cache keys that can include dish name, country, and mode information
- Recipe generation will use the same models as the main search (fast mode model for fast recipes, detailed mode model for detailed recipes)
- Recipes will be formatted as text with step-by-step instructions (numbered or bulleted list format)
- The modal component will be accessible and support keyboard navigation
- Recipe cache TTL will be the same as cultural data cache (20 minutes) or can be configured independently
- Users understand that clicking on dish names will show recipe details
- The "View the recipe" hover label provides sufficient indication that dish names are interactive
- Recipe generation may take longer than dish search, especially in detailed mode
- Some dishes may not have traditional recipes, and the system should handle this gracefully
- The modal will be responsive and work on mobile, tablet, and desktop devices

