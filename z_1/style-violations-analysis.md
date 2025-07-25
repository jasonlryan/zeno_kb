# Style Violations Analysis & Mapping Strategy

## Summary

- **Total Violations**: 165
- **Inline Styles**: 81
- **Unknown Classes**: 82
- **Arbitrary Colors**: 2

## Priority Fix Order

### 1. IGNORE: Node Modules (119 violations)

- Skip all `node_modules/` violations - these are external libraries
- Focus only on our code: **46 real violations**

### 2. HIGH PRIORITY: Core Components (29 violations)

#### ChatPanel.tsx (4 violations)

- 2 inline styles (lines 188, 192)
- 2 placeholder classes (`placeholder-gray-500`, `dark:placeholder-gray-400`)

#### CuratorDashboard.tsx (15 violations)

- 2 inline styles (lines 355, 772)
- 2 placeholder classes
- 11 `whitespace-nowrap` classes

#### FeaturedCarousel.tsx (5 violations)

- 1 inline style (line 74)
- 4 scroll/snap classes (`scrollbar-hide`, `snap-x`, `snap-mandatory`, `snap-start`)

#### TopSearchBar.tsx (4 violations)

- 2 transform classes (`transform`, `-translate-y-1/2`)
- 2 placeholder classes

#### UserList.tsx (4 violations)

- 4 `whitespace-nowrap` classes

### 3. MEDIUM PRIORITY: Other Components (11 violations)

#### FilterPanel.tsx (6 violations)

- 2 transform classes
- 4 `group` classes

#### FavoriteModal.tsx (2 violations)

- 2 placeholder classes

#### LearningGuideCard.tsx (3 violations)

- 2 transform classes
- 1 template literal class

### 4. LOW PRIORITY: Pages & Misc (6 violations)

#### app/login-test.tsx (6 violations)

- 6 inline styles

## Mapping Strategy

### A. Create Missing CSS Classes in globals.css

```css
/* Placeholder styling */
.zeno-placeholder {
  @apply placeholder-gray-500 dark:placeholder-gray-400;
}

/* Transform utilities */
.zeno-transform-center {
  @apply transform -translate-y-1/2;
}

.zeno-transform-hover {
  @apply transform hover:-translate-y-1/2;
}

/* Scroll utilities */
.zeno-scroll-snap {
  @apply scrollbar-hide snap-x snap-mandatory;
}

.zeno-snap-item {
  @apply snap-start;
}

/* Layout utilities */
.zeno-nowrap {
  @apply whitespace-nowrap;
}

.zeno-group {
  @apply group;
}
```

### B. Replace Inline Styles with Existing Classes

- `style={{width: '300px'}}` → `className="w-75"`
- `style={{padding: '1rem'}}` → `className="zeno-content-padding"`
- `style={{display: 'flex'}}` → `className="flex"`

### C. Update Tailwind Safelist

Add commonly used classes to prevent purging:

- `placeholder-gray-500`
- `dark:placeholder-gray-400`
- `whitespace-nowrap`
- `transform`
- `group`
- `snap-x`
- `snap-mandatory`
- `scrollbar-hide`

## Implementation Plan

1. **Update Tailwind Config** - Add safelist for valid Tailwind classes
2. **Add Missing CSS Classes** - Create zeno-prefixed utilities in globals.css
3. **Fix Components One by One** - Start with ChatPanel, then CuratorDashboard
4. **Test Each Fix** - Verify UI remains intact after each component fix
5. **Run Audit After Each Fix** - Ensure violation count decreases

## Expected Outcome

- From **165 violations** to **0 violations**
- All styles use proper `zeno-` prefixed classes or approved Tailwind utilities
- UI remains visually identical
- Consistent styling system across entire codebase
