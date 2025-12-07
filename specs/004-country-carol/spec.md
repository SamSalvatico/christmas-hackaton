# Feature Specification: Country Christmas Carol

**Feature Branch**: `004-country-carol`  
**Created**: 2024-12-19  
**Status**: Draft  
**Input**: User description: "in the same request made to the LLM, also need to ask for a famous christmas carol for that country. We just need the name, and, when available, the author. follow the same caching and retry logic already setup in step 3"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Include Christmas Carol in LLM Query (Priority: P1)

A user selects a country and triggers a request to find famous dishes and a Christmas carol for that country. The system queries an LLM model in a single request to retrieve both dishes and a famous Christmas carol, returning the carol name and author (when available) along with the dish information.

**Why this priority**: This is the core functionality that extends the existing dish query to include Christmas carol information. Without including the carol in the LLM query, the feature cannot deliver value. It establishes the foundation for displaying both dishes and carol information to users.

**Independent Test**: Can be fully tested by selecting a country, triggering the query, and verifying the system returns dishes and a Christmas carol with name and optional author. The test can use a mock LLM response to verify the carol data extraction logic.

**Acceptance Scenarios**:

1. **Given** a user has selected a country, **When** they trigger the search, **Then** the system queries the LLM model with both dishes and Christmas carol requests in a single query
2. **Given** the LLM returns dish and carol information, **When** the system processes the response, **Then** it extracts the Christmas carol name and author (when available)
3. **Given** the LLM returns a carol without author information, **When** the system processes the response, **Then** it stores only the carol name and sets author to null or omits it
4. **Given** the LLM returns no carol information, **When** the system processes the response, **Then** it handles the missing carol gracefully (displays dishes only or shows carol as unavailable)
5. **Given** the LLM returns invalid or malformed data, **When** the system detects this, **Then** it automatically retries the request with a refined query (same retry logic as dishes)
6. **Given** the LLM query fails due to rate limiting or service unavailability, **When** the system handles the error, **Then** it displays a user-friendly error message (same error handling as dishes)

---

### User Story 2 - Display Christmas Carol Information (Priority: P2)

A user sees the famous Christmas carol for their selected country displayed alongside the dish information, showing the carol name and author (when available).

**Why this priority**: This provides the user interface for viewing the Christmas carol information. It depends on User Story 1 (the LLM query) but can be tested independently with mock data. It delivers the visual presentation that makes the carol information accessible to users.

**Independent Test**: Can be fully tested by providing mock carol data and verifying the UI displays the carol name and author (when available) alongside dish information. The test verifies the layout and information presentation without requiring the LLM integration.

**Acceptance Scenarios**:

1. **Given** carol data has been retrieved for a country, **When** the page renders, **Then** the carol name is displayed alongside dish information
2. **Given** carol data includes author information, **When** the page renders, **Then** the author is displayed along with the carol name
3. **Given** carol data does not include author information, **When** the page renders, **Then** only the carol name is displayed (author is omitted)
4. **Given** no carol information is available, **When** the page renders, **Then** the carol section is omitted or shows a message indicating no carol found
5. **Given** the data is loading, **When** the user views the page, **Then** a loading indicator is displayed (same as dishes)

---

### Edge Cases

- What happens when the LLM returns dishes but no carol information?
- What happens when the LLM returns a carol but no author information?
- How does the system handle countries with no famous Christmas carols?
- How does the system handle very long carol names or author names?
- How does the system handle special characters in carol names or author names?
- What happens when the carol information is invalid but dishes are valid?
- How does the system handle cases where carol data is present but dishes are missing?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST query an LLM model in a single request to retrieve both famous dishes and a Christmas carol for a selected country
- **FR-002**: System MUST extract and store the Christmas carol name from the LLM response
- **FR-003**: System MUST extract and store the Christmas carol author from the LLM response when available
- **FR-004**: System MUST handle cases where author information is not available (store as null or omit)
- **FR-005**: System MUST display the Christmas carol name alongside dish information
- **FR-006**: System MUST display the Christmas carol author when available
- **FR-007**: System MUST omit author display when author information is not available
- **FR-008**: System MUST handle missing carol information gracefully (display dishes only or show carol unavailable message)
- **FR-009**: System MUST use the same caching logic as dishes (20-minute TTL, valid responses only)
- **FR-010**: System MUST use the same retry logic as dishes (automatic retry with refined query for invalid/malformed responses)
- **FR-011**: System MUST use the same error handling as dishes (user-friendly messages for rate limits, service unavailable, etc.)
- **FR-012**: System MUST cache carol information together with dishes in the same cache entry
- **FR-013**: System MUST return cached carol data when available and not expired (within 20 minutes, same as dishes)

### Key Entities *(include if feature involves data)*

- **Christmas Carol**: Represents a famous Christmas carol from a country. Key attributes: name (string, required), author (string, optional - when available), country (string)
- **Country Cultural Data**: Represents the combined response for dishes and carol for a country. Key attributes: dishes (DishesResponse), carol (ChristmasCarol | null), country (string)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can retrieve Christmas carol information for a selected country within 10 seconds of initiating the search (same as dishes)
- **SC-002**: The system successfully returns carol information (name and optional author) for 90% of country queries that have famous Christmas carols
- **SC-003**: Users can view carol information alongside dish information within 2 seconds of receiving the LLM response
- **SC-004**: The system handles missing carol information gracefully, displaying dishes without carol for 95% of cases where carol is unavailable
- **SC-005**: The system maintains response quality, with carol names being accurate and authors being correct (when provided) for 95% of returned carols
- **SC-006**: The cache successfully reduces LLM API calls by serving cached carol data together with dishes for 20 minutes after initial fetch

## Assumptions

- The LLM can understand requests for both dishes and Christmas carols in a single query
- The LLM can return structured information including carol name and optional author
- Christmas carols exist for most countries, but some countries may not have famous Christmas carols
- Author information may not always be available or known for traditional/folk carols
- The feature extends feature 003 (country dishes) and uses the same LLM query, caching, and retry mechanisms
- Carol information is cached together with dishes in the same cache entry (20-minute TTL)
- Invalid or malformed responses trigger automatic retry with refined query (same as dishes)
- Rate limiting or service unavailability results in user-friendly error messages (same as dishes)
- The carol query is included in the same API endpoint and request flow as dishes
- Display of carol information follows the same patterns as dish display (JSON format initially)
