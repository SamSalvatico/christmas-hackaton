# Data Model: Christmas Home Page Redesign

**Date**: 2024-12-19  
**Feature**: Christmas Home Page Redesign

## Overview

This feature is a frontend redesign that does not introduce new data structures. It uses existing data types from `lib/types/cultural-data.ts` and focuses on how data is displayed and organized in the UI. The data model describes component-level data structures, display logic, and UI state management.

## Existing Data Types (No Changes)

The following types from `lib/types/cultural-data.ts` are used as-is:

- `Dish`: Represents a dish with name, description, ingredients, type, country
- `DishesResponse`: Contains entry, main, and dessert dishes (each can be null)
- `ChristmasCarol`: Represents a carol with name, author, country
- `CountryCulturalData`: Combined structure with dishes, carol, and spotifyUrl
- `CulturalDataApiRequest`: API request with country name
- `CulturalDataApiResponse`: API response (success or error)

## Component-Level Data Structures

### DishCardProps

Props for the DishCard component that displays individual dishes.

**Attributes**:
- `dish` (Dish): The dish to display
  - **Type**: `Dish`
  - **Required**: Yes
  - **Validation**: Must be a valid Dish object
- `dishType` (string): Category label for the dish
  - **Type**: `"Entry" | "Main Course" | "Dessert"`
  - **Required**: Yes
  - **Validation**: Must match dish.type value
  - **Display**: Used as card header/title
- `className` (string): Optional CSS classes for styling
  - **Type**: `string | undefined`
  - **Required**: No
  - **Validation**: Valid CSS class names

**Usage**: Passed to DishCard component to render individual dish information in a card format.

### ChristmasSpinnerProps

Props for the Christmas-themed loading spinner component.

**Attributes**:
- `message` (string): Loading message to display
  - **Type**: `string`
  - **Required**: No (has default)
  - **Default**: `"Santa is searching for Christmas traditions..."`
  - **Validation**: Non-empty string if provided
  - **Examples**: 
    - `"Santa is searching for Christmas traditions..."`
    - `"Loading Christmas magic..."`
    - `"Finding festive dishes and carols..."`
- `size` (string): Spinner size
  - **Type**: `"sm" | "md" | "lg"`
  - **Required**: No (has default)
  - **Default**: `"lg"`
  - **Validation**: Must be one of the specified values

**Usage**: Passed to ChristmasSpinner component to display festive loading state.

### CarolLinkProps

Props for the Christmas carol link component.

**Attributes**:
- `carol` (ChristmasCarol): The carol information
  - **Type**: `ChristmasCarol`
  - **Required**: Yes
  - **Validation**: Must be a valid ChristmasCarol object
- `spotifyUrl` (string | null): Spotify URL for the carol
  - **Type**: `string | null`
  - **Required**: No (can be null)
  - **Validation**: If provided, must be a valid URL
  - **Display**: Opens in new tab when clicked

**Usage**: Passed to CarolLink component to display carol information with Spotify link.

### HomePageState

Client-side state managed in the HomePage component.

**Attributes**:
- `selectedCountry` (string | null): Currently selected country
  - **Type**: `string | null`
  - **Required**: No (can be null)
  - **Validation**: If not null, must be a valid country name
  - **Source**: From CountryDropdown component
- `culturalData` (CountryCulturalData | null): Retrieved cultural data
  - **Type**: `CountryCulturalData | null`
  - **Required**: No (can be null)
  - **Validation**: If not null, must be valid CountryCulturalData
  - **Source**: From `/api/cultural-data` API response
- `isLoading` (boolean): Loading state flag
  - **Type**: `boolean`
  - **Required**: Yes
  - **Default**: `false`
  - **Validation**: Boolean value
  - **Usage**: Controls display of loading spinner
- `error` (string | null): Error message if request fails
  - **Type**: `string | null`
  - **Required**: No (can be null)
  - **Validation**: If not null, must be user-friendly error message
  - **Source**: From API error response or exception

**State Transitions**:
1. **Initial**: `selectedCountry: null`, `culturalData: null`, `isLoading: false`, `error: null`
2. **Country Selected**: `selectedCountry: "Italy"`, other states unchanged
3. **Search Initiated**: `isLoading: true`, `error: null`, `culturalData: null` (cleared)
4. **Search Success**: `isLoading: false`, `culturalData: {...}`, `error: null`
5. **Search Error**: `isLoading: false`, `culturalData: null`, `error: "Error message"`

## Display Logic

### Dish Display Logic

**Input**: `DishesResponse` object with entry, main, and dessert (each can be null)

**Processing**:
1. Filter out null values (only display dishes that exist)
2. Map each dish to a DishCard component
3. Order: Entry → Main → Dessert (if available)
4. Display in responsive grid layout

**Output**: Array of DishCard components, one per non-null dish

**Example**:
```typescript
// Input
dishes: {
  entry: { name: "Bruschetta", ... },
  main: { name: "Pasta Carbonara", ... },
  dessert: null
}

// Output: 2 DishCard components
// 1. Entry: Bruschetta
// 2. Main Course: Pasta Carbonara
```

### Ingredient Display Logic

**Input**: `ingredients: string[]` array from Dish object

**Processing**:
1. Check array length
2. If length <= 8: Display all ingredients
3. If length > 8: Display first 8 ingredients + "There's more!" message

**Output**: Array of ingredient strings (possibly truncated) for display

**Example**:
```typescript
// Input: ["ingredient1", "ingredient2", ..., "ingredient10"]
// Output (if length > 8): ["ingredient1", ..., "ingredient8", "There's more!"]
```

### Carol Link Display Logic

**Input**: `ChristmasCarol` object and `spotifyUrl: string | null`

**Processing**:
1. Display carol name as heading
2. Display author if available (with "by" prefix)
3. If spotifyUrl exists: Display clickable link that opens in new tab
4. If spotifyUrl is null: Display "not found on spotify" message

**Output**: CarolLink component with carol information and optional Spotify link

**Example**:
```typescript
// Input
carol: { name: "Tu scendi dalle stelle", author: "Alfonso Maria de' Liguori", country: "Italy" }
spotifyUrl: "https://open.spotify.com/track/..."

// Output: CarolLink component with:
// - Heading: "Tu scendi dalle stelle"
// - Author: "by Alfonso Maria de' Liguori"
// - Link: "🎵 Listen on Spotify" (opens in new tab)
```

## Responsive Layout Data

### Breakpoint Definitions

**Mobile** (< 768px):
- Container: Full width with padding
- Dropdown/Button: Full width, stacked vertically
- Dish Cards: 1 column grid
- Spacing: Reduced padding and margins

**Tablet** (768px - 1024px):
- Container: Max-width with centered layout
- Dropdown/Button: Side-by-side or stacked based on space
- Dish Cards: 2 column grid
- Spacing: Medium padding and margins

**Desktop** (> 1024px):
- Container: Max-width with centered layout
- Dropdown/Button: Side-by-side, centered
- Dish Cards: 3 column grid (or 2 if only 2 dishes)
- Spacing: Generous padding and margins

### Grid Layout Logic

**Input**: Array of DishCard components (1-3 items)

**Processing**:
1. Count number of dishes
2. Determine grid columns based on screen size and dish count:
   - Mobile: Always 1 column
   - Tablet: 2 columns (if 2+ dishes), 1 column (if 1 dish)
   - Desktop: 3 columns (if 3 dishes), 2 columns (if 2 dishes), 1 column (if 1 dish)

**Output**: CSS Grid layout with appropriate column count

## Christmas Theme Data

### Color Palette

**Primary Colors**:
- `christmasRed`: `#DC2626` (buttons, accents)
- `christmasGreen`: `#16A34A` (success, links)
- `christmasGold`: `#D97706` (highlights)
- `christmasWhite`: `#FFFFFF` (backgrounds, text on dark)
- `christmasDarkGreen`: `#15803D` (text on light)
- `christmasDarkRed`: `#B91C1C` (text on light)

**Contrast Ratios** (WCAG AA compliant):
- Normal text (4.5:1): All colors meet requirement on white background
- Large text (3:1): All colors meet requirement on white background

### Theme Application

**Components**:
- **DishCard**: Christmas-themed border colors, subtle background
- **Spinner**: Christmas colors (red/green/gold rotation)
- **CarolLink**: Green color for success/link state
- **Button**: Red or green primary color
- **Dropdown**: Christmas-themed focus states

## Validation Rules

### Component Props Validation

1. **DishCard**: `dish` must be valid Dish object, `dishType` must match dish.type
2. **ChristmasSpinner**: `message` must be non-empty if provided, `size` must be valid
3. **CarolLink**: `carol` must be valid ChristmasCarol, `spotifyUrl` must be valid URL if provided

### State Validation

1. **selectedCountry**: If not null, must be a valid country name from countries list
2. **culturalData**: If not null, must be valid CountryCulturalData with at least one dish
3. **isLoading**: Must be boolean, should be false when culturalData or error is set
4. **error**: If not null, must be user-friendly, non-technical error message

### Display Validation

1. **Dish Display**: Only non-null dishes are displayed, order is entry → main → dessert
2. **Ingredient Display**: Maximum 8 ingredients shown, with "There's more!" if truncated
3. **Carol Display**: Carol information displayed only if carol exists, Spotify link only if URL exists
4. **Responsive Layout**: Grid columns must adapt to screen size and content count

## Data Flow

### User Interaction Flow

```
User selects country from dropdown
  ↓
selectedCountry state updated
  ↓
User clicks Santa Search button
  ↓
isLoading: true, error: null, culturalData: null
  ↓
API request to /api/cultural-data
  ↓
[Loading spinner displayed]
  ↓
API response received
  ├─ Success? → culturalData: {...}, isLoading: false
  └─ Error? → error: "message", isLoading: false
  ↓
[Dish cards and carol link displayed if success]
```

### Component Rendering Flow

```
HomePage component
  ↓
CountryDropdown (manages selectedCountry)
  ↓
SantaSearchButton (triggers search)
  ↓
[If isLoading: ChristmasSpinner]
  ↓
[If culturalData: DishCard components + CarolLink]
  ↓
[If error: Error message display]
```

## Type Definitions

```typescript
// Component Props
interface DishCardProps {
  dish: Dish;
  dishType: "Entry" | "Main Course" | "Dessert";
  className?: string;
}

interface ChristmasSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

interface CarolLinkProps {
  carol: ChristmasCarol;
  spotifyUrl: string | null;
}

// HomePage State (internal)
interface HomePageState {
  selectedCountry: string | null;
  culturalData: CountryCulturalData | null;
  isLoading: boolean;
  error: string | null;
}

// Christmas Theme Colors
interface ChristmasTheme {
  red: string;
  green: string;
  gold: string;
  white: string;
  darkGreen: string;
  darkRed: string;
}
```

