# Implementation Plan: Dish Recipe Viewing

**Branch**: `009-dish-recipe-view` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-dish-recipe-view/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Allow users to view step-by-step recipes for dishes by making dish names clickable with hover tooltip. Add `/api/recipe` endpoint that accepts country name, dish name, and search mode. Implement caching using dish name, country, and mode. Display recipes in a modal with step-by-step navigation using a click button. Show Santa loader during recipe retrieval and handle errors gracefully.

## Technical Context

**Language/Version**: TypeScript 5.9.3, Node.js >=24.0.0  
**Primary Dependencies**: Next.js 16.0.7, React 19.2.1, HeroUI (@heroui/react 2.8.5), OpenAI SDK 6.10.0  
**Storage**: In-memory cache (Map-based) with TTL support  
**Testing**: Jest/React Testing Library (to be confirmed)  
**Target Platform**: Web (Next.js App Router, server-side rendering)  
**Project Type**: Web application (Next.js with React)  
**Performance Goals**: Cached recipes return within 100ms; hover tooltip appears within 200ms; modal displays successfully for 95% of requests  
**Constraints**: Maintain consistency with existing search mode selection; cache keys must include dish name, country, and mode to prevent cross-contamination  
**Scale/Scope**: Single feature addition to existing dish display functionality

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

Verify compliance with core principles:

- **Modular Architecture**: ✅ PASS
  - Clear module boundaries: UI component (clickable dish name, modal), API route (recipe endpoint), service layer (recipe generation), cache utility
  - Unidirectional dependencies: UI → API → Service → OpenAI SDK
  - Independently testable: Each layer can be tested in isolation (component tests, API route tests, service unit tests)

- **Code Readability**: ✅ PASS
  - Self-documenting structure: TypeScript types, clear function names, component props interfaces
  - Naming conventions: Consistent camelCase for variables, PascalCase for components, kebab-case for files
  - Documentation: JSDoc comments for functions, inline comments for complex logic (cache key generation, recipe formatting)

- **User-Centric Design**: ✅ PASS
  - User needs considered: Clickable dish names with hover feedback, step-by-step recipe navigation, error handling with retry
  - Intuitive interface: Tooltip on hover indicates clickability, modal displays recipes clearly, step-by-step navigation button
  - User-friendly error messages: Existing error handling patterns maintained, recipe-specific errors handled gracefully
  - Accessibility: HeroUI components provide built-in ARIA support, modal supports keyboard navigation

### Post-Design Check

After Phase 1 design completion, all principles remain compliant:

- **Modular Architecture**: ✅ PASS
  - Design maintains clear separation: RecipeModal component, Recipe API route, recipe generation service
  - Dependencies remain unidirectional
  - All components independently testable

- **Code Readability**: ✅ PASS
  - Data model defines clear types (Recipe, RecipeStep, RecipeApiRequest)
  - API contracts provide clear request/response schemas
  - Component props interfaces well-defined

- **User-Centric Design**: ✅ PASS
  - Modal design supports step-by-step navigation
  - Error handling with retry option
  - Tooltip provides clear affordance
  - Loading states provide appropriate feedback

Any violations MUST be documented in the Complexity Tracking section below with justification.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── api/
│   └── recipe/
│       └── route.ts              # NEW: Recipe API endpoint
└── page.tsx                      # Updated: Add recipe modal state and handlers

components/
└── features/
    ├── dish-card.tsx             # Updated: Make dish name clickable with tooltip
    └── recipe-modal.tsx          # NEW: Modal component for recipe display

lib/
├── api/
│   └── openai-service.ts         # Extended: Add recipe generation function
├── types/
│   └── cultural-data.ts          # Extended: Add Recipe type
└── utils/
    └── cache.ts                  # Existing cache utility (no changes needed)

tests/
├── unit/
│   ├── components/
│   │   └── recipe-modal.test.tsx
│   └── api/
│       └── recipe.test.ts
└── integration/
    └── recipe-flow.test.ts
```

**Structure Decision**: Next.js App Router structure with clear separation:
- **app/**: Next.js App Router routes and pages
- **components/**: React components organized by feature
- **lib/**: Shared utilities, services, and types
- **tests/**: Test files mirroring source structure

This structure maintains consistency with existing codebase patterns and follows Next.js 16 conventions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
