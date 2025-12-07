# Tasks: Christmas Home Page Redesign

**Input**: Design documents from `/specs/007-christmas-home-redesign/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Testing is deferred for now - will be added later if needed. Focus on keeping implementation simple.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/` for routes and API, `components/` for UI, `lib/` for utilities
- Paths follow Next.js 16 App Router structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create Christmas theme utilities and foundational styling infrastructure

- [ ] T001 [P] Create Christmas theme color constants in `lib/utils/christmas-theme.ts`
- [ ] T002 [P] Create Christmas theme utility functions (contrast helpers, color getters) in `lib/utils/christmas-theme.ts`
- [ ] T003 [P] Export Christmas theme utilities from `lib/utils/christmas-theme.ts` for component usage

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core components that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create DishCard component with props interface in `components/features/dish-card.tsx`
- [ ] T005 [P] Create ChristmasSpinner component with props interface in `components/features/christmas-spinner.tsx`
- [ ] T006 [P] Create CarolLink component with props interface in `components/features/carol-link.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Access Christmas-Themed Home Page on Any Device (Priority: P1) 🎯 MVP

**Goal**: Create a responsive, Christmas-themed home page that works on all devices with a funny, Christmas-related title

**Independent Test**: Open the home page on different device sizes (mobile, tablet, desktop) and verify that all content is readable, interactive elements are accessible, and the Christmas theme is visually present. The test delivers a welcoming, festive interface that works on any device.

### Implementation for User Story 1

- [ ] T007 [US1] Implement DishCard component with HeroUI Card, CardHeader, CardBody in `components/features/dish-card.tsx`
- [ ] T008 [US1] Add ingredient truncation logic (max 8 items) to DishCard component in `components/features/dish-card.tsx`
- [ ] T009 [US1] Apply Christmas-themed styling (colors, borders) to DishCard component in `components/features/dish-card.tsx`
- [ ] T010 [US1] Implement ChristmasSpinner component with HeroUI Spinner and festive message in `components/features/christmas-spinner.tsx`
- [ ] T011 [US1] Apply Christmas colors (red/green/gold) to ChristmasSpinner component in `components/features/christmas-spinner.tsx`
- [ ] T012 [US1] Implement CarolLink component with HeroUI Link and Spotify URL handling in `components/features/carol-link.tsx`
- [ ] T013 [US1] Add `target="_blank"` and `rel="noopener noreferrer"` to CarolLink component in `components/features/carol-link.tsx`
- [ ] T014 [US1] Apply Christmas-themed styling (green color) to CarolLink component in `components/features/carol-link.tsx`
- [ ] T015 [US1] Redesign home page layout with centered dropdown and button in `app/page.tsx`
- [ ] T016 [US1] Add funny Christmas-related title to home page in `app/page.tsx`
- [ ] T017 [US1] Implement responsive layout (mobile/tablet/desktop breakpoints) in `app/page.tsx`
- [ ] T018 [US1] Remove JSON display and replace with component-based display in `app/page.tsx`
- [ ] T019 [US1] Add responsive grid layout for dish cards (1-3 columns based on screen size) in `app/page.tsx`
- [ ] T020 [US1] Ensure all interactive elements are touch-friendly (minimum 44x44px) on mobile in `app/page.tsx`
- [ ] T021 [US1] Verify no horizontal scrolling on mobile devices (< 768px) in `app/page.tsx`
- [ ] T022 [US1] Verify layout adapts smoothly to device orientation changes in `app/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. The home page should display with Christmas theme, be responsive, and have a funny title.

---

## Phase 4: User Story 2 - Intuitive Country Selection and Cultural Data Discovery (Priority: P1)

**Goal**: Enhance the country selection dropdown and ensure intuitive display of cultural data with proper loading states

**Independent Test**: Have a new user (who has never seen the app) open the home page and successfully complete the flow of selecting a country and viewing the cultural data without confusion or needing instructions. The test delivers a self-explanatory interface that guides users through the discovery process.

### Implementation for User Story 2

- [ ] T023 [US2] Enhance CountryDropdown placeholder text to be more user-friendly in `components/features/country-dropdown.tsx`
- [ ] T024 [US2] Apply Christmas-themed styling (focus states, colors) to CountryDropdown component in `components/features/country-dropdown.tsx`
- [ ] T025 [US2] Ensure CountryDropdown search functionality works reliably in `components/features/country-dropdown.tsx`
- [ ] T026 [US2] Make CountryDropdown touch-friendly on mobile devices in `components/features/country-dropdown.tsx`
- [ ] T027 [US2] Enhance SantaSearchButton with Christmas-themed styling in `components/features/santa-search-button.tsx`
- [ ] T028 [US2] Integrate ChristmasSpinner into home page loading state in `app/page.tsx`
- [ ] T029 [US2] Display ChristmasSpinner when search is initiated (within 100ms) in `app/page.tsx`
- [ ] T030 [US2] Replace JSON display with individual DishCard components for each dish in `app/page.tsx`
- [ ] T031 [US2] Display dish cards in responsive grid layout (entry, main, dessert) in `app/page.tsx`
- [ ] T032 [US2] Integrate CarolLink component below dish cards in `app/page.tsx`
- [ ] T033 [US2] Display CarolLink only when carol data is available in `app/page.tsx`
- [ ] T034 [US2] Ensure CarolLink opens Spotify URL in new tab in `components/features/carol-link.tsx`
- [ ] T035 [US2] Add user-friendly error messages (non-technical) to home page in `app/page.tsx`
- [ ] T036 [US2] Ensure error messages are clearly visible and actionable in `app/page.tsx`
- [ ] T037 [US2] Add clear visual hierarchy to guide users through the discovery flow in `app/page.tsx`
- [ ] T038 [US2] Ensure all content is readable without horizontal scrolling on mobile in `app/page.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can select a country, see loading spinner, and view dishes and carol in an organized format.

---

## Phase 5: User Story 3 - Engaging Christmas Visual Design (Priority: P2)

**Goal**: Enhance the visual design with Christmas-themed elements (colors, typography, spacing) that create a festive atmosphere while maintaining readability

**Independent Test**: Open the home page and verify that Christmas-themed visual elements (colors, imagery, decorations) are present and create a festive atmosphere without compromising readability or usability. The test delivers a visually appealing, holiday-appropriate interface.

### Implementation for User Story 3

- [ ] T039 [US3] Apply Christmas color scheme (reds, greens, golds, whites) throughout home page in `app/page.tsx`
- [ ] T040 [US3] Ensure all text meets WCAG AA contrast ratios (4.5:1 normal, 3:1 large) in `app/page.tsx`
- [ ] T041 [US3] Apply Christmas-themed typography (if appropriate) while maintaining readability in `app/page.tsx`
- [ ] T042 [US3] Enhance visual spacing and layout for festive atmosphere in `app/page.tsx`
- [ ] T043 [US3] Add subtle Christmas-themed visual elements without cluttering in `app/page.tsx`
- [ ] T044 [US3] Ensure Christmas theme enhances rather than distracts from functionality in `app/page.tsx`
- [ ] T045 [US3] Verify all components maintain Christmas theme consistency in `components/features/`
- [ ] T046 [US3] Test color contrast on all components for accessibility compliance

**Checkpoint**: All user stories should now be independently functional with a complete Christmas-themed, responsive, and user-friendly interface.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final polish, accessibility verification, and cross-cutting improvements

- [ ] T047 [P] Verify responsive design on actual devices (mobile, tablet, desktop)
- [ ] T048 [P] Test all interactive elements for touch accessibility (44x44px minimum)
- [ ] T049 [P] Verify WCAG AA color contrast compliance across all components
- [ ] T050 [P] Test page load performance (< 2s target)
- [ ] T051 [P] Verify loading spinner appears within 100ms of user action
- [ ] T052 [P] Test device orientation changes (portrait/landscape) for smooth adaptation
- [ ] T053 [P] Verify long text content (country names, dish descriptions) doesn't break layout
- [ ] T054 [P] Test error handling with user-friendly messages
- [ ] T055 [P] Verify all links open correctly (Spotify links in new tab)
- [ ] T056 [P] Code cleanup and refactoring for consistency
- [ ] T057 [P] Add JSDoc comments to all new components
- [ ] T058 [P] Run quickstart.md validation scenarios
- [ ] T059 [P] Verify no console errors or warnings
- [ ] T060 [P] Final visual review and polish

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1) can start after Foundational
  - User Story 2 (P1) can start after Foundational (may use components from US1)
  - User Story 3 (P2) can start after Foundational (enhances US1 and US2)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Creates core components and responsive layout
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Uses components from US1, enhances dropdown and data display
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Enhances visual design of US1 and US2 components

### Within Each User Story

- Component creation before integration
- Styling after component structure
- Responsive design throughout
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Stories 1 and 2 can start in parallel (if team capacity allows)
- Components within a story marked [P] can run in parallel
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all component implementations together:
Task: "Implement DishCard component with HeroUI Card, CardHeader, CardBody in components/features/dish-card.tsx"
Task: "Implement ChristmasSpinner component with HeroUI Spinner and festive message in components/features/christmas-spinner.tsx"
Task: "Implement CarolLink component with HeroUI Link and Spotify URL handling in components/features/carol-link.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch all enhancement tasks together:
Task: "Enhance CountryDropdown placeholder text to be more user-friendly in components/features/country-dropdown.tsx"
Task: "Enhance SantaSearchButton with Christmas-themed styling in components/features/santa-search-button.tsx"
Task: "Replace JSON display with individual DishCard components for each dish in app/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (Christmas theme utilities)
2. Complete Phase 2: Foundational (Core components)
3. Complete Phase 3: User Story 1 (Responsive Christmas theme)
4. Complete Phase 4: User Story 2 (Core functionality)
5. **STOP and VALIDATE**: Test User Stories 1 & 2 independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Full MVP!)
4. Add User Story 3 → Test independently → Deploy/Demo (Enhanced MVP)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (components and layout)
   - Developer B: User Story 2 (enhancements and integration)
3. Once US1 and US2 complete:
   - Developer A: User Story 3 (visual polish)
   - Developer B: Polish & Cross-Cutting
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All components should use Christmas theme utilities from `lib/utils/christmas-theme.ts`
- Maintain existing API contract (`/api/cultural-data`) - no backend changes needed
- Focus on frontend redesign with HeroUI components and responsive design

