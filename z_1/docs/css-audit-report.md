# Zeno KB CSS Audit Report

## Overview

Analysis of `z_1/styles/globals.css` for duplicate/similar classes and consolidation opportunities.

---

## 🔴 Critical Issues

### 1. **Duplicate Typography Classes**

- `.zeno-headline` and `.zeno-heading` are **identical**
  - Both: `font-family: 'Gotham Bold'`, `letter-spacing: -0.04em`, `line-height: 0.95`
  - **Fix**: Remove one, keep `.zeno-heading`

### 2. **Redundant Color Variant Pattern**

Multiple components have `-blue`, `-gray` variants that could be consolidated:

#### Buttons (6 classes → 2 classes)

- `.zeno-button-primary`, `.zeno-button-blue`, `.zeno-button-gray` → Use CSS variables
- `.zeno-button-large`, `.zeno-button-large-blue`, `.zeno-button-large-gray` → Use CSS variables

#### Badges (3 classes → 1 class)

- `.zeno-badge`, `.zeno-badge-blue`, `.zeno-badge-gray` → Use CSS variables

#### Info/Alert Boxes (6 classes → 2 classes)

- `.zeno-info-box`, `.zeno-info-box-blue`, `.zeno-info-box-gray` → Use CSS variables
- `.zeno-alert-box`, `.zeno-alert-box-blue`, `.zeno-alert-box-gray` → Use CSS variables

#### Categories (3 classes → 1 class)

- `.zeno-category`, `.zeno-category-blue`, `.zeno-category-gray` → Use CSS variables

---

## 🟡 Inconsistencies

### 3. **Mixed Color Systems**

- Some classes use CSS variables: `var(--zeno-green)`
- Others use Tailwind colors: `bg-blue-600`, `text-gray-700`
- **Fix**: Standardize on CSS variables for brand consistency

### 4. **Inconsistent Naming**

- `.zeno-tag` vs `.zeno-tag-large` (size variant)
- `.zeno-button-primary` vs `.zeno-button-large` (different naming pattern)
- **Fix**: Use consistent `-size` suffix pattern

### 5. **Spacing Inconsistencies**

- `.zeno-content-padding`: `1.5rem`
- `.zeno-logo-safe-area`: `1rem`
- Info/alert boxes: `p-4` and `p-6`
- **Fix**: Define spacing scale in CSS variables

---

## 🟢 Consolidation Recommendations

### Proposed Structure:

```css
/* Base component classes */
.zeno-button {
  /* shared button styles */
}
.zeno-badge {
  /* shared badge styles */
}
.zeno-info-box {
  /* shared info box styles */
}

/* Color modifiers using CSS custom properties */
.zeno-primary {
  --component-bg: var(--zeno-green);
  --component-text: white;
}
.zeno-secondary {
  --component-bg: var(--zeno-gray);
  --component-text: white;
}
.zeno-neutral {
  --component-bg: var(--zeno-light-gray);
  --component-text: var(--zeno-dark-gray);
}

/* Size modifiers */
.zeno-small {
  --component-padding: 0.5rem 1rem;
  --component-text-size: 0.75rem;
}
.zeno-medium {
  --component-padding: 0.75rem 1.5rem;
  --component-text-size: 0.875rem;
}
.zeno-large {
  --component-padding: 1rem 2rem;
  --component-text-size: 1.125rem;
}
```

### Benefits:

- **58 classes → ~20 classes** (65% reduction)
- **Consistent color system** using CSS variables
- **Composable design** (`.zeno-button.zeno-primary.zeno-large`)
- **Easier maintenance** (change colors in one place)

---

## 🔧 Action Items

1. **Remove duplicate `.zeno-headline`** (keep `.zeno-heading`)
2. **Consolidate color variants** using CSS custom properties
3. **Standardize on CSS variables** for all colors
4. **Create spacing scale** in CSS variables
5. **Implement composable class system** for buttons, badges, boxes
6. **Update style auditor** to enforce new class patterns

---

## Estimated Impact

- **Before**: 58 component classes, inconsistent patterns
- **After**: ~20 base classes + modifiers, consistent system
- **Developer Experience**: Clearer naming, fewer classes to remember
- **Maintenance**: Single source of truth for colors/spacing
