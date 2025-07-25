# Tag System Restoration

## Issue

Created **3 different inconsistent tag styles** when consolidating CSS, breaking the original unified design system.

## Original System (from backup)

The backup CSS had a **clean, purpose-driven approach**:

### 1. **Tags** - Gray (neutral content)

```css
.zeno-tag {
  @apply bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200;
}

.zeno-tag-large {
  @apply bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200;
}
```

### 2. **Categories** - Green (brand color for groupings)

```css
.zeno-category {
  @apply bg-green-50 text-green-700 hover:bg-green-100;
}
```

### 3. **Types** - Color-coded by type (functional differentiation)

```css
.zeno-type-gpt {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200;
}
```

## What I Fixed

### ❌ **Before (Messy)**

- Mixed CSS custom properties with Tailwind classes
- Inconsistent padding/sizing across similar elements
- 3 different styling approaches for similar components

### ✅ **After (Clean)**

- **Unified approach**: All use `@apply` with Tailwind classes
- **Consistent sizing**: Same padding patterns across similar elements
- **Clear purpose**: Each element type has distinct, logical styling

## Result

### Visual Consistency

- **Tags**: Gray, small, rounded corners (neutral content markers)
- **Categories**: Green, medium, rounded-full (brand-colored groupings)
- **Types**: Color-coded, small, rounded-full (functional differentiation)

### Code Consistency

- All use same `@apply` pattern
- Dark mode support built-in
- Hover states where appropriate
- Consistent spacing and typography

## Usage Examples

```jsx
{/* Tags - Gray, neutral */}
<span className="zeno-tag">audience-insights</span>
<span className="zeno-tag-large">consumer-behavior</span>

{/* Categories - Green, branded */}
<span className="zeno-category">Audience Research</span>
<span className="zeno-category">Industries & Trends</span>

{/* Types - Color-coded by function */}
<span className="zeno-type zeno-type-gpt">GPT</span>
<span className="zeno-type zeno-type-doc">Doc</span>
```

This restores the **original unified design language** while maintaining the type-specific colors you needed.
