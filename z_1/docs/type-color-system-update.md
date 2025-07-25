# Type Color System Update

## Issue Fixed

The new streamlined CSS system was showing **purple for all tool types** instead of the proper type-specific colors from the taxonomy manager.

## Root Cause

- The new `.zeno-type` class defaulted to `var(--zeno-purple)` for all types
- Lost the original type-specific color mapping from `taxonomyManager.ts`
- Components were using generic `.zeno-type` instead of type-specific classes

## Solution Implemented

### 1. **Type-Specific CSS Classes Added**

```css
.zeno-type-gpt {
  --component-bg: #3b82f6; /* Blue */
}

.zeno-type-platform {
  --component-bg: #10b981; /* Green */
}

.zeno-type-tool {
  --component-bg: #f59e0b; /* Amber */
}

.zeno-type-doc {
  --component-bg: #6b7280; /* Gray */
}

.zeno-type-video {
  --component-bg: #ef4444; /* Red */
}

.zeno-type-learning-guide {
  --component-bg: var(--zeno-purple); /* Purple */
}

.zeno-type-script {
  --component-bg: var(--zeno-orange); /* Orange */
}
```

### 2. **Component Updates**

- **ToolCard.tsx**: Now uses `zeno-type zeno-type-${type}` pattern
- **ToolDetailModal.tsx**: Updated to use type-specific classes
- Added `cn` utility import where missing

### 3. **Color Mapping**

| Type           | Color  | Hex Code             |
| -------------- | ------ | -------------------- |
| GPT            | Blue   | `#3B82F6`            |
| Platform       | Green  | `#10B981`            |
| Tool           | Amber  | `#F59E0B`            |
| Doc            | Gray   | `#6B7280`            |
| Video          | Red    | `#EF4444`            |
| Learning Guide | Purple | `var(--zeno-purple)` |
| Script         | Orange | `var(--zeno-orange)` |

## Result

✅ **GPT tools now show blue badges** (as in your screenshot)  
✅ **Each type has its distinct color**  
✅ **Maintains the composable CSS system**  
✅ **Preserves existing taxonomy manager colors**

## Usage

Components automatically apply the correct color by combining:

```jsx
<span
  className={cn(
    "zeno-type",
    `zeno-type-${tool.type.toLowerCase().replace(/\s+/g, "-")}`
  )}
>
  {tool.type}
</span>
```

This ensures GPT tools show blue, Platform tools show green, etc., matching your original design intent.
