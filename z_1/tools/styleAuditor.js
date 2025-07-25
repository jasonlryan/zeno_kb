#!/usr/bin/env node
/**
 * Zeno KB — Styles Audit Tool
 * Scans project files for style violations against brand rules.
 */
const { program } = require("commander");
const fg = require("fast-glob");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

program
  .name("style-audit")
  .description("Audit codebase for brand style violations")
  .option("--dir <path>", "Directory to scan", ".")
  .option("--json", "Emit JSON report")
  .option("--ignore <globs>", "Comma-separated glob patterns to exclude");

program.parse(process.argv);
const opts = program.opts();

// Build glob patterns
const patterns = [`${opts.dir}/**/*.{tsx,ts,jsx,js,css,scss}`];
const ignorePatterns = opts.ignore
  ? opts.ignore.split(",").map((p) => p.trim())
  : [];

(async () => {
  const files = await fg(patterns, { ignore: ignorePatterns, dot: false });
  const violations = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((lineContent, idx) => {
      // 1. Detect inline style attributes
      if (/style\s*=\s*\{\{/.test(lineContent)) {
        violations.push({
          file,
          line: idx + 1,
          type: "inline-style",
          message: "Inline style attribute is disallowed",
          suggestion:
            "Replace with approved utility classes or brand component",
        });
      }

      // 2. Detect arbitrary Tailwind colours (e.g., bg-#hex, text-#hex)
      if (
        /(bg|text|border|ring|outline|shadow)-\[#[0-9a-fA-F]{3,6}\]/.test(
          lineContent
        )
      ) {
        violations.push({
          file,
          line: idx + 1,
          type: "arbitrary-colour",
          message: "Arbitrary-value Tailwind colour outside brand palette",
          suggestion:
            "Use CSS variables (var(--zeno-*)) or predefined utilities",
        });
      }

      // 3. Detect classes that should use zeno- system instead of Tailwind
      const classAttrMatch = lineContent.match(
        /className\s*=\s*{?\s*["'`]([^"'`]+)["'`]/
      );
      if (classAttrMatch) {
        const classNames = classAttrMatch[1].split(/\s+/);
        classNames.forEach((cls) => {
          if (cls && !cls.startsWith("zeno-") && !isAllowedTailwindClass(cls)) {
            violations.push({
              file,
              line: idx + 1,
              type: "should-use-zeno",
              message: `Class '${cls}' should use zeno- system instead of raw Tailwind`,
              suggestion: `Replace with zeno- equivalent or approved utility`,
            });
          }
        });
      }
    });
  }

  report(violations, opts.json);

  if (violations.length > 0) {
    process.exitCode = 1;
  }
})();

function isAllowedTailwindClass(cls) {
  // Only allow specific Tailwind classes that are approved in the zeno system
  const allowedClasses = [
    // Layout & Display - Core structural classes
    "flex",
    "inline-flex",
    "block",
    "inline-block",
    "grid",
    "inline-grid",
    "hidden",
    "absolute",
    "relative",
    "fixed",
    "sticky",
    "static",

    // Flexbox & Grid - Essential layout
    "flex-1",
    "flex-none",
    "flex-shrink-0",
    "flex-grow",
    "items-center",
    "items-start",
    "items-end",
    "items-stretch",
    "justify-center",
    "justify-start",
    "justify-end",
    "justify-between",
    "justify-around",
    "self-center",
    "self-start",
    "self-end",

    // Spacing - Only common utilities
    "space-x-1",
    "space-x-2",
    "space-x-3",
    "space-x-4",
    "space-y-1",
    "space-y-2",
    "space-y-4",
    "space-y-8",
    "space-y-16",
    "gap-1",
    "gap-2",
    "gap-3",
    "gap-4",
    "gap-6",
    "gap-8",
    "gap-12",

    // Sizing - Essential sizing only
    "w-full",
    "w-auto",
    "w-fit",
    "h-full",
    "h-auto",
    "h-fit",
    "w-4",
    "w-5",
    "w-16",
    "w-80",
    "h-4",
    "h-5",
    "h-16",
    "h-2",
    "min-h-screen",
    "max-w-md",
    "max-w-5xl",
    "max-w-6xl",

    // Positioning
    "top-1/2",
    "left-3",
    "right-0",
    "inset-0",
    "z-10",
    "z-50",

    // Overflow & Scrolling
    "overflow-hidden",
    "overflow-x-auto",
    "overflow-auto",

    // Borders & Radius - Basic only
    "border",
    "border-t",
    "border-b",
    "rounded",
    "rounded-lg",
    "rounded-full",
    "divide-y",
    "divide-gray-200",
    "dark:divide-gray-700",

    // Shadows
    "shadow",
    "shadow-sm",
    "shadow-lg",
    "shadow-xl",

    // Transitions & Animations
    "transition",
    "transition-all",
    "transition-colors",
    "transition-transform",
    "duration-200",
    "duration-300",
    "ease-in-out",
    "animate-spin",
    "animate-bounce",

    // Cursor & Interaction
    "cursor-pointer",
    "cursor-not-allowed",
    "hover:shadow-md",
    "hover:scale-[1.02]",
    "focus:outline-none",
    "focus:ring-2",

    // Dark mode system colors (these are approved)
    "text-foreground",
    "text-muted-foreground",
    "text-card-foreground",
    "text-primary",
    "text-white",
    "bg-background",
    "bg-card",
    "bg-primary",
    "bg-white",
    "bg-black",
    "border-border",
    "border-primary",

    // Grid system
    "grid-cols-1",
    "lg:grid-cols-2",
    "min-w-full",

    // Table classes
    "table",
    "table-auto",

    // Text utilities that are structural
    "text-left",
    "text-center",
    "text-right",
    "text-xs",
    "text-sm",
    "text-lg",
    "text-xl",
    "text-4xl",
    "font-medium",
    "font-semibold",
    "uppercase",
    "tracking-wider",
    "line-clamp-2",
    "line-clamp-3",
    "break-words",
    "leading-tight",
    "leading-relaxed",

    // Responsive prefixes
    "sm:px-6",
    "lg:px-8",
    "md:",
    "lg:",
    "xl:",
    "2xl:",

    // Component state classes
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",

    // Template literals and dynamic classes
    "${className}",
    "${",
    "}",
    "`",

    // Dark mode variants
    "dark:bg-gray-800",
    "dark:bg-gray-700",
    "dark:text-white",
    "dark:text-gray-100",
    "dark:border-gray-700",
    "dark:border-gray-600",
    "dark:hover:bg-gray-800",
  ];

  // Check if it's an allowed class or starts with allowed prefix
  return (
    allowedClasses.includes(cls) ||
    allowedClasses.some((allowed) => cls.startsWith(allowed)) ||
    (cls.startsWith("hover:") &&
      isAllowedTailwindClass(cls.replace("hover:", ""))) ||
    (cls.startsWith("focus:") &&
      isAllowedTailwindClass(cls.replace("focus:", ""))) ||
    (cls.startsWith("dark:") &&
      isAllowedTailwindClass(cls.replace("dark:", ""))) ||
    (cls.startsWith("sm:") && isAllowedTailwindClass(cls.replace("sm:", ""))) ||
    (cls.startsWith("md:") && isAllowedTailwindClass(cls.replace("md:", ""))) ||
    (cls.startsWith("lg:") && isAllowedTailwindClass(cls.replace("lg:", "")))
  );
}

function isTailwindClass(cls) {
  // Comprehensive Tailwind class detection
  const coreClasses = [
    // Layout
    "container",
    "box-border",
    "box-content",
    "block",
    "inline-block",
    "inline",
    "flex",
    "inline-flex",
    "table",
    "inline-table",
    "table-caption",
    "table-cell",
    "table-column",
    "table-column-group",
    "table-footer-group",
    "table-header-group",
    "table-row-group",
    "table-row",
    "flow-root",
    "grid",
    "inline-grid",
    "contents",
    "list-item",
    "hidden",

    // Position
    "static",
    "fixed",
    "absolute",
    "relative",
    "sticky",

    // Visibility
    "visible",
    "invisible",
    "collapse",

    // Typography standalone
    "italic",
    "not-italic",
    "antialiased",
    "subpixel-antialiased",
    "uppercase",
    "lowercase",
    "capitalize",
    "normal-case",
    "truncate",
    "text-ellipsis",
    "text-clip",
    "break-normal",
    "break-words",
    "break-all",
    "break-keep",

    // Accessibility
    "sr-only",
    "not-sr-only",
  ];

  const corePrefixes = [
    // Flexbox & Grid
    "flex-",
    "grid-",
    "col-",
    "row-",
    "auto-cols-",
    "auto-rows-",
    "gap-",
    "justify-",
    "items-",
    "content-",
    "self-",
    "place-",
    "order-",

    // Spacing
    "p-",
    "m-",
    "px-",
    "py-",
    "pt-",
    "pr-",
    "pb-",
    "pl-",
    "mx-",
    "my-",
    "mt-",
    "mr-",
    "mb-",
    "ml-",
    "space-x-",
    "space-y-",

    // Sizing
    "w-",
    "min-w-",
    "max-w-",
    "h-",
    "min-h-",
    "max-h-",

    // Typography
    "font-",
    "text-",
    "leading-",
    "tracking-",
    "line-clamp-",

    // Backgrounds
    "bg-",
    "from-",
    "via-",
    "to-",

    // Borders
    "border-",
    "border",
    "divide-",
    "outline-",
    "ring-",
    "rounded-",
    "rounded",

    // Effects
    "shadow-",
    "shadow",
    "opacity-",
    "mix-blend-",
    "bg-blend-",

    // Position values
    "inset-",
    "top-",
    "right-",
    "bottom-",
    "left-",
    "z-",

    // Overflow
    "overflow-",
    "overscroll-",

    // Transitions & Animation
    "transition-",
    "transition",
    "duration-",
    "ease-",
    "delay-",
    "animate-",

    // Transforms
    "scale-",
    "rotate-",
    "translate-",
    "skew-",
    "origin-",

    // Interactivity
    "cursor-",
    "pointer-events-",
    "resize-",
    "select-",
    "appearance-",

    // Filters
    "blur-",
    "brightness-",
    "contrast-",
    "drop-shadow-",
    "grayscale-",
    "hue-rotate-",
    "invert-",
    "saturate-",
    "sepia-",
    "backdrop-",

    // Other
    "object-",
    "fill-",
    "stroke-",
  ];

  // Responsive prefixes
  const responsivePrefixes = ["sm:", "md:", "lg:", "xl:", "2xl:"];

  // State prefixes
  const statePrefixes = [
    "hover:",
    "focus:",
    "focus-within:",
    "focus-visible:",
    "active:",
    "visited:",
    "target:",
    "first:",
    "last:",
    "odd:",
    "even:",
    "disabled:",
    "enabled:",
    "checked:",
    "required:",
    "valid:",
    "invalid:",
    "dark:",
    "group-hover:",
    "group-focus:",
  ];

  // Check exact matches first
  if (coreClasses.includes(cls)) return true;

  // Check prefixes
  if (corePrefixes.some((p) => cls.startsWith(p))) return true;

  // Check responsive/state prefixes
  for (const prefix of [...responsivePrefixes, ...statePrefixes]) {
    if (cls.startsWith(prefix)) {
      const withoutPrefix = cls.substring(prefix.length);
      return isTailwindClass(withoutPrefix);
    }
  }

  return false;
}

function report(list, emitJson) {
  if (emitJson) {
    const summary = { violations: list.length };
    const files = {};
    list.forEach((v) => {
      files[v.file] = files[v.file] || [];
      files[v.file].push(v);
    });
    const out = { summary, files };
    fs.writeFileSync(
      "tools/style-audit-report.json",
      JSON.stringify(out, null, 2)
    );
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  if (list.length === 0) {
    console.log(chalk.green("✓ No style violations found"));
    return;
  }

  console.log(
    chalk.red(
      `✖ ${list.length} style violation${list.length > 1 ? "s" : ""} found`
    )
  );
  const grouped = list.reduce((acc, v) => {
    acc[v.type] = (acc[v.type] || 0) + 1;
    return acc;
  }, {});

  Object.entries(grouped).forEach(([type, count]) => {
    console.log(`   • ${count.toString().padEnd(3)} ${type}`);
  });

  // Print first 10 violations details
  list.slice(0, 10).forEach((v) => {
    console.log(`\n${chalk.yellow(v.file)}:${v.line}`);
    console.log(`  ${v.message}`);
    if (v.suggestion) console.log(chalk.gray(`  ↳ ${v.suggestion}`));
  });
}
