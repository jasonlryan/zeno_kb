# Zeno KB — Styles Audit Tool Specification

## Overview

The **Styles Audit Tool** is a developer utility that scans the Zeno KB codebase and surfaces any styling that deviates from the brand guidelines defined in `z_1/styles/globals.css` and the Tailwind configuration.

_Written in TypeScript, runnable via `pnpm audit:styles` (script will be added to `package.json`)._

---

## Goals

1. **Consistency** – Ensure every new feature/component uses the same approved styling primitives.
2. **Safety** – Catch inline styles, rogue colour values, and un-prefixed custom classes before they reach production.
3. **Visibility** – Generate human-readable & machine-readable (JSON) reports so violations are obvious in PRs and CI.
4. **Productivity** – Offer autofix suggestions or optional ESLint fixes so developers can correct issues quickly.

---

## Input Scope

| File type                        | Included? | Notes                            |
| -------------------------------- | --------- | -------------------------------- |
| `*.tsx`, `*.ts`, `*.jsx`, `*.js` | ✅        | Source & pages/components        |
| `*.css`, `*.scss`                | ✅        | Especially for stray class names |
| `*.md`, `*.mdx`                  | 🚫        | Ignored by default               |

The tool will default to scanning `z_1/` but can be pointed elsewhere via CLI flags (`--dir`).

---

## Validation Rules

1. **Allowed Styling Mechanisms**

   - Tailwind utility classes (`bg-gray-100`, `flex`, `md:w-1/2`, …).
   - Brand utilities defined in `globals.css` and starting with `zeno-*`.
   - Component-level CSS modules _if_ the class name starts with `zeno-` and is declared in a companion `.module.css` file.

2. **Disallowed / Flagged**

   - Inline style attributes _except_ whitelisted dynamic cases (e.g. chart library injecting colours).
   - Arbitrary-value Tailwind classes (`bg-[#00ff00]`, `text-[18px]`) unless colour/value maps to a declared CSS variable `var(--zeno-*)`.
   - Hard-coded colour classes that don’t match Zeno palette (`bg-green-600` → should use `bg-primary` or a `zeno-*` utility).
   - Custom class names **not** prefixed with `zeno-`.

3. **Colour Checking**

   - Parse Tailwind utilities & CSS hex codes.
   - Compare colours against the allowed palette derived from CSS variables in `:root`.

4. **Typography / Font Usage**

   - Verify any `font-family` style or Tailwind `font-*` class aligns with Gotham / Dharma families or Tailwind defaults.

5. **Sizing & Spacing** (future)
   - Optionally enforce an 8-point grid by checking `p-*`, `m-*`, `gap-*` values.

---

## Report Format

_Console Summary_ (colour-coded):

```
✖ 12 styling violations found
   • 5   inline style attributes
   • 3   arbitrary-value colours outside palette
   • 4   unknown custom classes (missing `zeno-` prefix)
```

_JSON Output_ (saved to `tools/style-audit-report.json`):

```json
{
  "summary": { "violations": 12 },
  "files": {
    "app/components/BadButton.tsx": [
      {
        "line": 42,
        "type": "inline-style",
        "message": "Inline style attribute is disallowed",
        "suggestion": "Replace with 'className=\"zeno-button-primary\"'"
      }
    ]
  }
}
```

This file can be consumed by CI or a GitHub Action to fail the build.

---

## Autofix Strategy (Optional Flag `--fix`)

1. Replace simple colour hex codes with corresponding CSS variables.
2. Map known improper classes to their `zeno-*` equivalents (lookup table).
3. Remove inline `style` blocks when a direct utility exists.

If a fix is ambiguous, the tool will leave the code unchanged and log a TODO comment.

---

## CLI Usage

```bash
pnpm audit:styles                                 # scan only
pnpm audit:styles --dir=z_1/app --json            # machine-readable output
pnpm audit:styles --fix                           # attempt autofixes
```

Flags

```
--dir <path>           Directory to scan (default: project root)
--json                 Emit JSON report
--fix                  Attempt autofix where safe
--ignore <globs>       Comma-separated glob patterns to skip
```

---

## Implementation Details

- **Language:** Node + TypeScript.
- **Parsing:** Use AST via `@typescript-eslint/typescript-estree` or `ts-morph` for TS/JS, PostCSS for CSS.
- **Colour Comparison:** Convert to HSL and match against palette array.
- **Config File:** `style-audit.config.ts` for overrides (allow additional utilities, whitelisted files, etc.).
- **Integration:**
  1. Expose `pnpm audit:styles` script in `package.json`.
  2. Add GitHub Action that runs on `pull_request` and fails if violations > 0.
  3. Optionally integrate as custom ESLint rule set (`eslint-plugin-zeno-style`).

---

## Timeline

| Phase | Task                           | Owner       | ETA     |
| ----- | ------------------------------ | ----------- | ------- |
| 1     | Spec approval (this doc)       | Dev team    | _Today_ |
| 2     | Parser & rule engine prototype | <your name> | +1 day  |
| 3     | Report generation & CLI flags  | <your name> | +2 days |
| 4     | Autofix mechanics              | <your name> | +3 days |
| 5     | CI integration & docs          | <your name> | +4 days |

---

## Next Steps

1. **Review & approve** this specification (add/edit rules as needed).
2. Start coding the auditor in `tools/styleAuditor.ts`.
3. Wire up CI & GitHub Action once the auditor passes initial tests.

_Feedback welcome — the stricter the rules, the more robust the tool!_
