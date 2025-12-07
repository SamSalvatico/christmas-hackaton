# Component Contracts: Christmas Home Page Redesign

**Date**: 2024-12-19  
**Feature**: Christmas Home Page Redesign

## Overview

This document defines the contracts (interfaces, props, and behavior) for the new and enhanced components in the Christmas home page redesign. These contracts ensure consistent implementation and maintainability.

## Component Contracts

### DishCard Component

**Purpose**: Display individual dish information in a card format with Christmas-themed styling.

**Location**: `components/features/dish-card.tsx`

**Props Contract**:
```typescript
interface DishCardProps {
  dish: Dish; // Required: Valid Dish object
  dishType: "Entry" | "Main Course" | "Dessert"; // Required: Category label
  className?: string; // Optional: Additional CSS classes
}
```

**Behavior Contract**:
- Displays dish name as card header/title
- Displays dish description in card body
- Displays ingredients list (truncated to 8 items if longer)
- Applies Christmas-themed styling (colors, borders)
- Responsive: Adapts to screen size
- Accessible: Proper ARIA labels and semantic HTML

**Visual Contract**:
- Card has Christmas-themed border color (red/green/gold based on type)
- Card has subtle background color
- Ingredients displayed as list with proper spacing
- Card has hover effect (if interactive)
- Card maintains minimum height for consistency

**Error Handling**:
- If dish is null or invalid, component should not render (handled by parent)
- If ingredients array is empty, display "No ingredients listed"

**Dependencies**:
- HeroUI Card, CardHeader, CardBody components
- Dish type from `@/lib/types/cultural-data`

---

### ChristmasSpinner Component

**Purpose**: Display a Christmas-themed loading spinner with festive message.

**Location**: `components/features/christmas-spinner.tsx`

**Props Contract**:
```typescript
interface ChristmasSpinnerProps {
  message?: string; // Optional: Loading message (default: "Santa is searching for Christmas traditions...")
  size?: "sm" | "md" | "lg"; // Optional: Spinner size (default: "lg")
}
```

**Behavior Contract**:
- Displays HeroUI Spinner with Christmas colors (red/green/gold)
- Displays loading message text below or beside spinner
- Centers spinner and message on screen
- Animates smoothly (60fps)
- Accessible: Proper ARIA labels for loading state

**Visual Contract**:
- Spinner uses Christmas color scheme (rotating red/green/gold)
- Message text is readable with proper contrast
- Spinner and message are centered horizontally and vertically
- Spinner size is appropriate for the context (large for page-level loading)

**Error Handling**:
- If message is empty string, use default message
- If size is invalid, use default size ("lg")

**Dependencies**:
- HeroUI Spinner component
- Christmas theme colors from `@/lib/utils/christmas-theme`

---

### CarolLink Component

**Purpose**: Display Christmas carol information with Spotify link that opens in new tab.

**Location**: `components/features/carol-link.tsx`

**Props Contract**:
```typescript
interface CarolLinkProps {
  carol: ChristmasCarol; // Required: Valid ChristmasCarol object
  spotifyUrl: string | null; // Optional: Spotify URL (can be null)
}
```

**Behavior Contract**:
- Displays carol name as heading
- Displays author if available (with "by" prefix)
- If spotifyUrl exists: Displays clickable link that opens in new tab
- If spotifyUrl is null: Displays "not found on spotify" message
- Link uses `target="_blank"` and `rel="noopener noreferrer"` for security
- Applies Christmas-themed styling (green for link)

**Visual Contract**:
- Carol name displayed prominently as heading
- Author displayed in smaller text below name
- Link styled with Christmas green color
- Link has hover effect
- Link includes icon (🎵 emoji or HeroUI icon)
- "Not found" message styled differently (gray, italic)

**Error Handling**:
- If carol is null or invalid, component should not render (handled by parent)
- If spotifyUrl is invalid URL, treat as null and show "not found" message

**Dependencies**:
- HeroUI Link component
- ChristmasCarol type from `@/lib/types/cultural-data`
- Christmas theme colors from `@/lib/utils/christmas-theme`

---

### Enhanced CountryDropdown Component

**Purpose**: Enhanced version of existing CountryDropdown with improved search and Christmas styling.

**Location**: `components/features/country-dropdown.tsx` (enhanced)

**Props Contract** (unchanged):
```typescript
interface CountryDropdownProps {
  onCountrySelect?: (country: string | null) => void; // Optional: Callback on selection
}
```

**Behavior Contract** (enhanced):
- Maintains existing search functionality (HeroUI Select built-in search)
- Enhanced placeholder text: More Christmas-themed or user-friendly
- Improved visual feedback when searching
- Christmas-themed styling (focus states, colors)
- Touch-friendly on mobile devices
- Accessible: Proper ARIA labels and keyboard navigation

**Visual Contract** (enhanced):
- Dropdown uses Christmas-themed focus colors
- Placeholder text is clear and helpful
- Search input is responsive and touch-friendly
- Dropdown menu has proper spacing and readability
- Selected item is clearly highlighted

**Error Handling** (unchanged):
- Loading state: Displays spinner with "Loading countries..." message
- Error state: Displays user-friendly error message
- Empty state: Displays "No countries found" if search returns no results

**Dependencies**:
- HeroUI Select, SelectItem, Spinner components
- CountriesList type from `@/lib/types/countries`
- Christmas theme colors from `@/lib/utils/christmas-theme`

---

### Enhanced SantaSearchButton Component

**Purpose**: Enhanced version of existing SantaSearchButton with Christmas styling.

**Location**: `components/features/santa-search-button.tsx` (enhanced)

**Props Contract** (unchanged):
```typescript
interface SantaSearchButtonProps {
  selectedCountry: string | null; // Required: Selected country or null
  onSearch?: (country: string) => void; // Optional: Callback on click
}
```

**Behavior Contract** (enhanced):
- Button is disabled when no country is selected
- Button uses Christmas-themed colors (red or green)
- Button has appropriate size for touch on mobile
- Button shows loading state if needed (handled by parent)
- Accessible: Proper ARIA labels and keyboard support

**Visual Contract** (enhanced):
- Button uses Christmas red or green color
- Button has hover and active states
- Button text is clear and readable
- Button is appropriately sized (large enough for touch)
- Button is centered with dropdown

**Error Handling** (unchanged):
- If selectedCountry is null, button is disabled
- If onSearch is not provided, button still renders but does nothing on click

**Dependencies**:
- HeroUI Button component
- Christmas theme colors from `@/lib/utils/christmas-theme`

---

## Layout Contracts

### HomePage Layout

**Purpose**: Main page layout with centered dropdown/button and results below.

**Location**: `app/page.tsx` (redesigned)

**Layout Structure**:
```
┌─────────────────────────────────┐
│     [Funny Christmas Title]     │
│   [Subtitle/Description]        │
│                                 │
│      [Country Dropdown]         │
│      [Santa Search Button]       │
│                                 │
│   [Loading Spinner if loading]  │
│                                 │
│   [Dish Cards Grid if loaded]   │
│   [Carol Link if loaded]         │
│                                 │
│   [Error Message if error]      │
└─────────────────────────────────┘
```

**Responsive Behavior**:
- **Mobile** (< 768px): Full width, stacked layout, 1 column grid
- **Tablet** (768px - 1024px): Centered with max-width, 2 column grid
- **Desktop** (> 1024px): Centered with max-width, 3 column grid

**State Management**:
- Manages selectedCountry, culturalData, isLoading, error states
- Coordinates between CountryDropdown, SantaSearchButton, and display components
- Handles API calls and error states

**Error Handling**:
- Displays user-friendly error messages
- Clears previous results on new search
- Handles network errors gracefully

---

## Theme Contract

### Christmas Theme Colors

**Location**: `lib/utils/christmas-theme.ts`

**Color Definitions**:
```typescript
export const christmasColors = {
  red: "#DC2626",        // Primary red (buttons, accents)
  green: "#16A34A",      // Primary green (success, links)
  gold: "#D97706",      // Gold (highlights)
  white: "#FFFFFF",      // White (backgrounds)
  darkGreen: "#15803D",  // Dark green (text)
  darkRed: "#B91C1C",    // Dark red (text)
};
```

**Usage Contract**:
- Colors must maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Colors should be applied consistently across components
- Colors should enhance, not distract from functionality

---

## API Contract (Unchanged)

The API contract for `/api/cultural-data` remains unchanged. See `specs/006-improve-api-naming/contracts/api-routes.md` for details.

**Summary**:
- **Endpoint**: `POST /api/cultural-data`
- **Request**: `{ country: string }`
- **Response**: `CulturalDataApiResponse` (success or error)
- **Success Data**: `CountryCulturalData` with dishes, carol, spotifyUrl

---

## Accessibility Contracts

All components must meet the following accessibility requirements:

1. **ARIA Labels**: Proper ARIA labels for screen readers
2. **Keyboard Navigation**: All interactive elements keyboard accessible
3. **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
4. **Focus Indicators**: Clear focus indicators for keyboard navigation
5. **Semantic HTML**: Use semantic HTML elements (header, main, section, etc.)
6. **Touch Targets**: Minimum 44x44px for touch on mobile devices

---

## Testing Contracts

Components should be testable with the following criteria:

1. **Props Validation**: Components handle invalid props gracefully
2. **State Management**: Components respond correctly to state changes
3. **Responsive Behavior**: Components adapt to different screen sizes
4. **Accessibility**: Components meet accessibility requirements
5. **Error Handling**: Components handle errors gracefully
6. **User Interaction**: Components respond correctly to user actions

