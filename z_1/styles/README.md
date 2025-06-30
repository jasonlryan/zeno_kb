# Zeno Brand Guidelines Implementation

This document outlines how the Zeno Brand Guidelines 2023 have been implemented in the codebase.

## Overview

The implementation includes:

1. **Color System**: All Zeno brand colors defined in CSS variables and Tailwind config
2. **Typography**: Font families, styles, and utilities based on brand guidelines
3. **Patterns & Gradients**: CSS utilities for brand-approved patterns and gradients
4. **Logo Usage**: Safe area utilities and guidelines

## Color System

### Primary Color
- **Zeno Green**: `#00BE65` (PMS 7481)

### Secondary Greens
- **Bright Green**: `#00FF00` (PMS 802)
- **Mid Green**: `#0C7547` (PMS 7732)
- **Deep Green**: `#043B32` (PMS 343)

### Secondary Highlight Colors
- **Yellow**: `#FFFF00` (PMS 803)
- **Purple**: `#BD01FE` (PMS 2592)
- **Reddish Orange**: `#FF4536` (PMS 171)
- **Orange**: `#FF6A32` (PMS 165)
- **Deep Purple**: `#731CB2` (PMS 2597)
- **Lavender**: `#BC77FB` (PMS 265)
- **Burgundy**: `#590A3B` (PMS 229)

### Neutral Colors
- **Black**: `#000000`
- **White**: `#FFFFFF`
- **Light Gray**: `#F3F3F1`
- **Medium Gray**: `#E1E0D8`
- **Dark Gray**: `#535953`

## Usage in Code

### Tailwind Classes

```jsx
// Using primary Zeno green
<div className="bg-zeno-green text-white">Primary Brand Color</div>

// Using secondary colors
<div className="bg-zeno-brightGreen">Bright Green</div>
<div className="bg-zeno-midGreen">Mid Green</div>
<div className="bg-zeno-deepGreen">Deep Green</div>

// Using highlight colors
<div className="bg-zeno-yellow">Yellow</div>
<div className="bg-zeno-purple">Purple</div>
```

### CSS Variables

```css
/* Using CSS variables */
.custom-element {
  background-color: var(--zeno-green);
  color: var(--zeno-white);
}

.accent-element {
  background-color: var(--zeno-purple);
  border: 2px solid var(--zeno-deep-green);
}
```

## Typography

### Font Families

- **Primary Font**: Gotham (Black, Bold, Book)
- **Secondary Font**: Dharma Gothic C Heavy (for logo lockups only)
- **System Font**: Arial (when Gotham is unavailable)

### Typography Utilities

```jsx
// Headlines
<h1 className="zeno-headline">Bold Headline Text</h1>

// Body copy
<p className="zeno-body">Regular body text follows the Zeno guidelines with proper leading and kerning.</p>

// Call to action
<button className="zeno-cta">LEARN MORE</button>

// Dharma Gothic (for special cases only)
<div className="zeno-dharma">SPECIAL DISPLAY TEXT</div>
```

## Patterns & Gradients

### Gradient

```jsx
<div className="zeno-gradient p-8">
  Content with Zeno gradient background
</div>
```

### Patterns

```jsx
// Dots pattern
<div className="zeno-pattern-dots p-8">
  Content with dots pattern
</div>

// Lines pattern
<div className="zeno-pattern-lines p-8">
  Content with lines pattern
</div>

// Grid pattern
<div className="zeno-pattern-grid p-8">
  Content with grid pattern
</div>
```

## Logo Usage

### Safe Area

The logo should always have adequate spacing around it. Use the `zeno-logo-safe-area` utility to ensure proper spacing:

```jsx
<div className="zeno-logo-safe-area">
  <img src="/path/to/zeno-logo.svg" alt="Zeno Logo" />
</div>
```

### Logo Colors

The Zeno logo should only appear in:
- Zeno Green (primary)
- Black (for light backgrounds with limited legibility)
- White (for dark backgrounds)

## Important Guidelines

1. **Logo Limitations**:
   - No distortion, drop shadows, outlines, or effects
   - No glossy version or feathering
   - No placement on busy backgrounds or backgrounds with low contrast
   - No rotation or recoloring

2. **Typography Rules**:
   - Do not use multiple weights in a headline
   - Keep color simple
   - Use Gotham Bold or Black for headlines
   - Use Gotham Book for body copy
   - Use uppercase for CTAs

3. **FPOTU (Fearless Pursuit of the Unexpected) Usage**:
   - Primary use: Left-aligned and stacked
   - "Unexpected" can be highlighted with a secondary color
   - The word "Fearless" should only be used as an adjective

## Font Implementation Note

The current implementation includes placeholder font imports. You'll need to:

1. Purchase the required fonts (Gotham and Dharma Gothic C Heavy)
2. Host them properly or use a font service
3. Update the font import URLs in `globals.css`

## Additional Resources

For complete brand guidelines, refer to the PDF document: `styles/Edited - Zeno Brand Guidelines 2023.pdf`
