# Feature Specification: Countries Searchable Dropdown

**Feature Branch**: `002-countries-dropdown`  
**Created**: 2024-12-19  
**Status**: Draft  
**Input**: User description: "second feature: Invoke the rest countries APIs getting the countries name and show them in a searchable dropdown list. We need to invoke the GET <https://restcountries.com/v3.1/all?fields=name> endpoint to get the full list of countries. It will respond with an array of items with this format { \"name\": { \"common\": \"Antigua and Barbuda\", \"official\": \"Antigua and Barbuda\", \"nativeName\": { \"eng\": { \"official\": \"Antigua and Barbuda\", \"common\": \"Antigua and Barbuda\" } } } }. We are interested in name.common. Once invoked, cache the list of name.common on the server side for 10 mins. It must be invoked by invoking a next js api. So: user invokes our next js apis, if not cached invoke the restcountries endpoint, cache it, then return an array with the countries list. Step after: add a searchable dropdown in the home page. Once home page is loading, invokes the countries api, it returns the list of countries and it fills the dropdown. then the user can search by its values and select only one. Once selected the user can click a \"Santa Search\" button that, at the moment, just write a console log"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Countries List API with Server-Side Caching (Priority: P1)

A user or application needs to retrieve a list of country names. The system fetches this data from an external REST Countries API, caches it server-side for 10 minutes to reduce external API calls, and returns a simple array of country names.

**Why this priority**: This is the foundation that provides the data for the dropdown. Without this API endpoint, the dropdown cannot be populated. The caching ensures efficient performance and reduces load on the external API.

**Independent Test**: Can be fully tested by calling the Next.js API endpoint and verifying it returns an array of country names. On first call, it should fetch from REST Countries API. On subsequent calls within 10 minutes, it should return cached data without external API calls.

**Acceptance Scenarios**:

1. **Given** the countries API endpoint is called for the first time, **When** the request is made, **Then** the system fetches data from REST Countries API and returns an array of country names (name.common values)
2. **Given** the countries API endpoint is called again within 10 minutes, **When** the request is made, **Then** the system returns cached data without calling the external API
3. **Given** the cache has expired (more than 10 minutes old), **When** the API endpoint is called, **Then** the system fetches fresh data from REST Countries API and updates the cache
4. **Given** the REST Countries API is unavailable, **When** the API endpoint is called, **Then** the system returns cached data if available, or a user-friendly error message if no cache exists

---

### User Story 2 - Searchable Country Dropdown on Home Page (Priority: P2)

A user visits the home page and sees a searchable dropdown list of countries. The dropdown is automatically populated when the page loads by calling the countries API, and users can search/filter the list to find a specific country.

**Why this priority**: This provides the user interface for country selection. It depends on User Story 1 (the API) but can be tested independently once the API exists. It delivers the core user experience of browsing and searching countries.

**Independent Test**: Can be fully tested by loading the home page, verifying the dropdown appears and is populated with countries, and testing the search/filter functionality to find specific countries in the list.

**Acceptance Scenarios**:

1. **Given** a user loads the home page, **When** the page finishes loading, **Then** the countries dropdown is automatically populated with the list of countries from the API
2. **Given** the dropdown is populated with countries, **When** a user types in the search field, **Then** the dropdown filters to show only countries matching the search text
3. **Given** a user is searching for a country, **When** they type part of a country name, **Then** matching countries are displayed in real-time as they type
4. **Given** the countries API call fails, **When** the home page loads, **Then** the dropdown displays a user-friendly error message instead of an empty list

---

### User Story 3 - Country Selection and Santa Search Action (Priority: P3)

A user selects a country from the dropdown and clicks a "Santa Search" button. The system records the selection and performs the search action (currently logging to console as a placeholder for future functionality).

**Why this priority**: This completes the user journey by allowing selection and action. It depends on User Story 2 (the dropdown) and represents the final step in the user workflow. The console log is a placeholder for future search functionality.

**Independent Test**: Can be fully tested by selecting a country from the dropdown, clicking the "Santa Search" button, and verifying the selection is logged to the browser console.

**Acceptance Scenarios**:

1. **Given** a user has searched and found a country in the dropdown, **When** they select a country, **Then** the selected country is displayed as the chosen value
2. **Given** a user has selected a country, **When** they click the "Santa Search" button, **Then** the selected country name is logged to the browser console
3. **Given** no country is selected, **When** a user clicks the "Santa Search" button, **Then** the button is disabled or shows a message prompting selection
4. **Given** a user selects a country and clicks "Santa Search", **When** the action completes, **Then** the selected country information is available for future processing

---

### Edge Cases

- What happens when the REST Countries API returns an unexpected data format?
- How does the system handle very long country names in the dropdown?
- What happens if the REST Countries API returns an empty array?
- How does the system behave when multiple users request countries simultaneously (cache consistency)?
- What happens if the cache expires while a request is in progress?
- How does the dropdown handle special characters in country names during search?
- What happens when a user types very quickly in the search field (debouncing)?
- How does the system handle network timeouts when fetching from REST Countries API?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Next.js API endpoint that returns a list of country names
- **FR-002**: System MUST fetch country data from REST Countries API endpoint (GET <https://restcountries.com/v3.1/all?fields=name>)
- **FR-003**: System MUST extract only the `name.common` field from each country object in the API response
- **FR-004**: System MUST cache the list of country names server-side for 10 minutes
- **FR-005**: System MUST return cached data when available and not expired (within 10 minutes)
- **FR-006**: System MUST fetch fresh data from REST Countries API when cache is expired or unavailable
- **FR-007**: System MUST return an array of country name strings (not objects) from the API endpoint
- **FR-008**: System MUST display a searchable dropdown component on the home page
- **FR-009**: System MUST automatically populate the dropdown with countries when the home page loads
- **FR-010**: System MUST allow users to search/filter countries by typing in the dropdown
- **FR-011**: System MUST display only countries matching the search text as the user types
- **FR-012**: System MUST allow users to select exactly one country from the dropdown
- **FR-013**: System MUST display a "Santa Search" button on the home page
- **FR-014**: System MUST enable the "Santa Search" button only when a country is selected
- **FR-015**: System MUST log the selected country name to the browser console when "Santa Search" is clicked
- **FR-016**: System MUST handle errors gracefully when the REST Countries API is unavailable
- **FR-017**: System MUST display user-friendly error messages if country data cannot be loaded

### Key Entities *(include if feature involves data)*

- **Country**: Represents a country entry from the REST Countries API. Key attributes: name.common (the country name string we extract and use)
- **Countries Cache**: Represents the server-side cached list of country names. Key attributes: country names array, timestamp of when cache was created, expiration time (10 minutes from creation)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can see the countries dropdown populated within 2 seconds of the home page loading
- **SC-002**: The countries API endpoint returns a list of country names in under 1 second when cache is available
- **SC-003**: The countries API endpoint fetches and returns data from REST Countries API in under 5 seconds when cache is expired
- **SC-004**: Users can successfully search and find any country in the list by typing at least 3 characters of the country name
- **SC-005**: Users can select a country and trigger the "Santa Search" action in under 5 seconds from page load
- **SC-006**: The cache successfully reduces external API calls by serving cached data for 10 minutes after initial fetch
- **SC-007**: Error messages are displayed clearly when country data cannot be loaded, allowing 90% of users to understand the issue

## Assumptions

- REST Countries API endpoint (<https://restcountries.com/v3.1/all?fields=name>) is publicly accessible and does not require authentication
- The API response format will remain consistent (array of objects with name.common field)
- Country names are displayed in English (name.common values)
- The dropdown should support searching by partial country name matches (case-insensitive)
- Server-side caching uses in-memory storage (suitable for single-instance deployment)
- The "Santa Search" button console log is a placeholder for future functionality
- Users expect real-time search filtering as they type (no significant delay)
