# Violation Mapping Strategy - Use Existing Zeno System

## Most Common Violations → Existing Zeno Classes

### **Text Colors (171 violations)**

- `text-gray-900` → `text-foreground` (41 violations)
- `text-gray-700` → `text-foreground` (35 violations)
- `text-gray-500` → `text-muted-foreground` (35 violations)
- `text-gray-600` → `text-muted-foreground` (28 violations)

### **Spacing (123 violations)**

- `mb-4` → Use existing `zeno-heading` or `zeno-body` classes (37 violations)
- `px-6` → Use existing `zeno-content-padding` (34 violations)
- `mb-2` → Use existing spacing in component classes (31 violations)
- `p-6` → Use existing `zeno-content-padding` (21 violations)

### **Backgrounds (22 violations)**

- `bg-gray-50` → `bg-muted` (22 violations)

### **Inline Styles (76 violations)**

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
