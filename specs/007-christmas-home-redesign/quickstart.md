# Quickstart Guide: Christmas Home Page Redesign

**Feature**: Christmas Home Page Redesign  
**Date**: 2024-12-19

## Prerequisites

- Node.js 24 or later installed
- npm or yarn package manager
- Git (for cloning the repository)
- Existing project setup (from previous features)

## Overview

This feature redesigns the home page to create a Christmas-themed, responsive, and user-friendly interface. The redesign replaces JSON output with individual dish cards, enhances the dropdown search, adds a Christmas-themed loading spinner, and ensures proper responsive layout.

## What Changed

### Visual Changes
- **Christmas Theme**: Page now uses Christmas colors (reds, greens, golds) with festive styling
- **Dish Cards**: Dishes are displayed in separate, styled cards instead of JSON
- **Loading Spinner**: Christmas-themed spinner with festive messages during loading
- **Carol Link**: Redesigned carol link that opens Spotify in a new tab
- **Layout**: Centered dropdown and button, results displayed below

### Component Changes
- **New Components**:
  - `DishCard`: Displays individual dishes in card format
  - `ChristmasSpinner`: Christmas-themed loading spinner
  - `CarolLink`: Redesigned carol link component
- **Enhanced Components**:
  - `CountryDropdown`: Improved search and Christmas styling
  - `SantaSearchButton`: Christmas-themed styling
  - `HomePage`: Complete redesign with new layout

### Functional Changes
- **No JSON Display**: API results are no longer displayed as JSON
- **Individual Dish Cards**: Each dish (entry, main, dessert) displayed in its own card
- **Responsive Grid**: Dish cards displayed in responsive grid (1-3 columns based on screen size)
- **New Tab Links**: Carol Spotify links open in new tab
- **Better Loading States**: Christmas-themed spinner with festive messages

## Setup

### Step 1: Verify Current Setup

Ensure you have the latest code from the feature branch:

```bash
git checkout 007-christmas-home-redesign
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Usage

### Basic Flow

1. **Open the application** in your browser: `http://localhost:3000`

2. **View the home page**:
   - You'll see a funny, Christmas-related title
   - Dropdown and button are centered on the page
   - Christmas-themed colors and styling throughout

3. **Select a country** from the dropdown:
   - Search functionality works as before
   - Dropdown has Christmas-themed styling
   - Touch-friendly on mobile devices

4. **Click "Santa Search" button**:
   - Button is enabled when country is selected
   - Christmas-themed loading spinner appears
   - Festive loading message displayed

5. **View results**:
   - Dish cards appear below the button (one per dish)
   - Each card shows: name, description, ingredients
   - Carol link appears below dishes (if carol available)
   - Spotify link opens in new tab when clicked

### Example Display

**Before (JSON)**:
```json
{
  "dishes": {
    "entry": { "name": "Bruschetta", ... },
    "main": { "name": "Pasta Carbonara", ... }
  }
}
```

**After (Cards)**:
- **Entry Card**: Bruschetta
  - Description: "Toasted bread topped with..."
  - Ingredients: bread, tomatoes, garlic, ...
- **Main Course Card**: Pasta Carbonara
  - Description: "A classic Roman pasta dish..."
  - Ingredients: pasta, eggs, cheese, ...

### Responsive Behavior

**Mobile** (< 768px):
- Full-width layout
- Dropdown and button stacked vertically
- Dish cards in 1 column
- Touch-friendly interactive elements

**Tablet** (768px - 1024px):
- Centered layout with max-width
- Dropdown and button side-by-side or stacked
- Dish cards in 2 columns
- Optimized spacing

**Desktop** (> 1024px):
- Centered layout with max-width
- Dropdown and button side-by-side, centered
- Dish cards in 2-3 columns (based on dish count)
- Generous spacing

---

## Testing Scenarios

### Scenario 1: Complete Flow with All Dishes

1. Select "Italy" from dropdown
2. Click "Santa Search"
3. **Expected**:
   - Christmas spinner appears with festive message
   - Three dish cards appear (Entry, Main, Dessert)
   - Carol link appears with Spotify URL
   - All cards are styled with Christmas theme

### Scenario 2: Partial Dishes

1. Select a country that may have fewer dishes
2. Click "Santa Search"
3. **Expected**:
   - Only available dish cards appear (e.g., only Main and Dessert)
   - Cards are displayed in responsive grid
   - Layout adapts to number of dishes

### Scenario 3: No Carol Available

1. Select a country without a famous Christmas carol
2. Click "Santa Search"
3. **Expected**:
   - Dish cards appear normally
   - No carol link displayed
   - No error message (carol is optional)

### Scenario 4: Spotify Link Not Found

1. Select a country with a carol but no Spotify match
2. Click "Santa Search"
3. **Expected**:
   - Dish cards appear
   - Carol information displayed
   - "not found on spotify" message shown (no link)

### Scenario 5: Error Handling

1. Temporarily break API endpoint
2. Select country and search
3. **Expected**:
   - Loading spinner appears
   - User-friendly error message displayed
   - No dish cards or carol link shown
   - Error message is clear and actionable

### Scenario 6: Responsive Testing

1. Open page on mobile device (or resize browser to < 768px)
2. **Expected**:
   - Layout adapts to mobile
   - All content readable without horizontal scrolling
   - Touch targets are appropriately sized
   - Dish cards in single column

3. Resize to tablet size (768px - 1024px)
4. **Expected**:
   - Layout adapts to tablet
   - Dish cards in 2 columns
   - Optimal spacing and readability

5. Resize to desktop size (> 1024px)
6. **Expected**:
   - Layout adapts to desktop
   - Dish cards in 2-3 columns
   - Centered layout with max-width

### Scenario 7: Loading State

1. Select country and click search
2. **Expected**:
   - Loading spinner appears within 100ms
   - Festive loading message displayed
   - Spinner uses Christmas colors
   - Previous results cleared

---

## Component Details

### DishCard Component

**Location**: `components/features/dish-card.tsx`

**Props**:
- `dish`: Dish object to display
- `dishType`: "Entry" | "Main Course" | "Dessert"
- `className`: Optional CSS classes

**Features**:
- Displays dish name, description, ingredients
- Truncates ingredients to 8 items (shows "There's more!" if longer)
- Christmas-themed styling
- Responsive card layout

### ChristmasSpinner Component

**Location**: `components/features/christmas-spinner.tsx`

**Props**:
- `message`: Optional loading message (default: "Santa is searching for Christmas traditions...")
- `size`: Optional spinner size (default: "lg")

**Features**:
- Christmas-themed colors (red/green/gold)
- Festive loading messages
- Centered display
- Accessible with ARIA labels

### CarolLink Component

**Location**: `components/features/carol-link.tsx`

**Props**:
- `carol`: ChristmasCarol object
- `spotifyUrl`: Spotify URL or null

**Features**:
- Displays carol name and author
- Clickable Spotify link (opens in new tab)
- "Not found" message if no Spotify URL
- Christmas-themed styling

---

## Troubleshooting

### Issue: Dish cards not displaying

**Solution**: Check that API is returning valid data. Verify `culturalData` state is set correctly.

### Issue: Loading spinner not showing

**Solution**: Verify `isLoading` state is being set to `true` when search is initiated.

### Issue: Layout breaks on mobile

**Solution**: Check responsive breakpoints and ensure Tailwind classes are applied correctly.

### Issue: Christmas colors not appearing

**Solution**: Verify `lib/utils/christmas-theme.ts` is created and colors are imported correctly.

### Issue: Spotify link not opening in new tab

**Solution**: Verify `target="_blank"` and `rel="noopener noreferrer"` attributes are set on Link component.

---

## Next Steps

After completing this feature:

1. **Test on real devices**: Verify responsive design on actual mobile, tablet, and desktop devices
2. **User testing**: Get feedback on Christmas theme and usability
3. **Accessibility audit**: Verify WCAG AA compliance
4. **Performance check**: Ensure page loads quickly and animations are smooth
5. **Browser testing**: Test on different browsers (Chrome, Firefox, Safari, Edge)

---

## References

- [Component Contracts](./contracts/component-contracts.md)
- [Data Model](./data-model.md)
- [Research](./research.md)
- [Implementation Plan](./plan.md)

