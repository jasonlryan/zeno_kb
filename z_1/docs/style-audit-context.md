# Style Audit Context & Violation Mapping Strategy

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

## Violation Mapping Strategy - Use Existing Zeno System

### Most Common Violations → Existing Zeno Classes

#### **Text Colors (171 violations)**

- `text-gray-900` → `text-foreground` (41 violations)
- `text-gray-700` → `text-foreground` (35 violations)
- `text-gray-500` → `text-muted-foreground` (35 violations)
- `text-gray-600` → `text-muted-foreground` (28 violations)

#### **Spacing (123 violations)**

- `mb-4` → Use existing `zeno-heading` or `zeno-body` classes (37 violations)
- `px-6` → Use existing `zeno-content-padding` (34 violations)
- `mb-2` → Use existing spacing in component classes (31 violations)
- `p-6` → Use existing `zeno-content-padding` (21 violations)

#### **Backgrounds (22 violations)**

- `bg-gray-50` → `bg-muted` (22 violations)

#### **Inline Styles (76 violations)**

- Replace with existing `zeno-` component classes
- Use CSS custom properties for dynamic values

## Implementation Strategy

### Phase 1A: Mass Replace Common Patterns

```bash
# Text colors
sed -i 's/text-gray-900/text-foreground/g' **/*.tsx
sed -i 's/text-gray-700/text-foreground/g' **/*.tsx
sed -i 's/text-gray-500/text-muted-foreground/g' **/*.tsx
sed -i 's/text-gray-600/text-muted-foreground/g' **/*.tsx

# Backgrounds
sed -i 's/bg-gray-50/bg-muted/g' **/*.tsx
```

### Phase 1B: Padding Strategy

- `px-6` + `py-4` → `zeno-content-padding`
- `p-6` → `zeno-content-padding`

### Phase 1C: Typography Strategy

- `mb-4` + text → Use `zeno-heading` or `zeno-body` (includes proper spacing)
- `mb-2` + text → Use `zeno-heading` or `zeno-body`

### Phase 1D: Fix Inline Styles

- Find all `style={{...}}` and replace with appropriate `zeno-` classes
- Use CSS custom properties for truly dynamic values

## Expected Results

- **294 violations fixed** with existing classes
- **No new CSS needed** - uses your established system
- **Consistent styling** following your design patterns
