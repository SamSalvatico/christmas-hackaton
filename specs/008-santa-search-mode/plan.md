# Implementation Plan: Santa Search Response Mode Selection

**Branch**: `008-santa-search-mode` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-santa-search-mode/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Allow users to choose between "Fast search" (using gpt-3.5-turbo) and "Detective Santa" (using o4-mini) response modes for Santa search. Add a mode selector UI component below the country autocomplete. Implement separate caching for each mode using cache keys that include both country name and mode type. Fast search is the default mode.

## Technical Context

**Language/Version**: TypeScript 5.9.3, Node.js >=24.0.0  
**Primary Dependencies**: Next.js 16.0.7, React 19.2.1, HeroUI (@heroui/react 2.8.5), OpenAI SDK 6.10.0  
**Storage**: In-memory cache (Map-based) with TTL support  
**Testing**: Jest/React Testing Library (to be confirmed)  
**Target Platform**: Web (Next.js App Router, server-side rendering)  
**Project Type**: Web application (Next.js with React)  
**Performance Goals**: Fast mode returns results at least 30% faster than detailed mode; cached responses return within 100ms  
**Constraints**: Maintain backward compatibility with existing API; cache keys must include mode to prevent cross-contamination  
**Scale/Scope**: Single feature addition to existing Christmas cultural data search application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with core principles:

- **Modular Architecture**: ✅ PASS
  - Clear module boundaries: UI component (mode selector), service layer (OpenAI service with mode parameter), API route (cultural-data), cache utility
  - Unidirectional dependencies: UI → API → Service → OpenAI SDK
  - Independently testable: Each layer can be tested in isolation (component tests, API route tests, service unit tests)

- **Code Readability**: ✅ PASS
  - Self-documenting structure: TypeScript types, clear function names, component props interfaces
  - Naming conventions: Consistent camelCase for variables, PascalCase for components, kebab-case for files
  - Documentation: JSDoc comments for functions, inline comments for complex logic (cache key generation, mode selection)

- **User-Centric Design**: ✅ PASS
  - User needs considered: Choice between speed and detail, default to faster mode for better initial experience
  - Intuitive interface: Mode selector placed logically below country dropdown, clear labels ("Fast search" vs "Detective Santa")
  - User-friendly error messages: Existing error handling patterns maintained, mode-specific errors handled gracefully
  - Accessibility: HeroUI components provide built-in ARIA support and keyboard navigation

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
│   └── cultural-data/
│       └── route.ts              # API route (extend to accept mode parameter)
└── page.tsx                      # Home page (add mode selector state)

components/
└── features/
    ├── country-dropdown.tsx      # Existing component
    ├── santa-search-button.tsx   # Existing component
    └── search-mode-selector.tsx   # NEW: Mode selector component

lib/
├── api/
│   └── openai-service.ts         # Extend to accept model parameter
├── types/
│   └── cultural-data.ts          # Extend types to include mode
└── utils/
    └── cache.ts                  # Existing cache utility (no changes needed)

tests/
├── unit/
│   ├── components/
│   │   └── search-mode-selector.test.tsx
│   └── api/
│       └── cultural-data.test.ts
└── integration/
    └── search-mode-flow.test.ts
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
