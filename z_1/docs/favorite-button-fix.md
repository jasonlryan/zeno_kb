# Favorite Button Visibility Fix

## Issue

The favorite heart icon became **hard to see** after the CSS consolidation changes.

## Root Cause

The favorite button was using `text-muted-foreground` for the unfavorited state, which resolves to:

- **Light mode**: `45.1%` gray (very light)
- **Dark mode**: `63.9%` gray (also quite light)

This made the heart icon nearly invisible against the card background.

## Solution Applied

### 1. **More Visible Icon Color**

```jsx
// Before (too light)
className = "text-muted-foreground hover:text-red-400";

// After (more visible)
className = "text-gray-400 hover:text-red-400";
```

### 2. **Better Hover Background**

```jsx
// Before (using CSS variable that might not work)
className = "hover:bg-secondary";

// After (explicit, reliable colors)
className = "hover:bg-gray-100 dark:hover:bg-gray-800";
```

### 3. **Consistent Across Components**

Updated both:

- **ToolCard.tsx** - Main grid view
- **ToolDetailModal.tsx** - Detail view

## Result

✅ **Heart icon is now clearly visible** in unfavorited state  
✅ **Hover states work reliably** with explicit colors  
✅ **Dark mode support** maintained  
✅ **Consistent behavior** across all components

## Visual States

- **Unfavorited**: Gray heart (`text-gray-400`) with hover effect
- **Favorited**: Red heart (`text-red-500`) with red fill
- **Hover**: Heart turns red (`hover:text-red-400`) with background highlight

The favorite functionality was always working - it was just a visibility issue with the icon styling.
