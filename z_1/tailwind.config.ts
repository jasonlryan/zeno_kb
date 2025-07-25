import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Zeno Brand Colors - Updated as per Brand Guidelines 2023
        zeno: {
          // Primary Color
          green: "#00BE65", // Primary brand color (PMS 7481)
          // Secondary Greens
          brightGreen: "#00FF00", // Bright Green (PMS 802)
          midGreen: "#0C7547", // Green (PMS 7732)
          deepGreen: "#043B32", // Deep Green (PMS 343)
          // Secondary Highlight Colors
          yellow: "#FFFF00", // Yellow (PMS 803)
          purple: "#BD01FE", // Purple (PMS 2592)
          reddishOrange: "#FF4536", // Reddish Orange (PMS 171)
          orange: "#FF6A32", // Orange (PMS 165)
          deepPurple: "#731CB2", // Deep Purple (PMS 2597)
          lavender: "#BC77FB", // Lavender (PMS 265)
          burgundy: "#590A3B", // Burgundy (PMS 229)
          // Neutral Colors
          black: "#000000", // Classic Black
          white: "#FFFFFF", // White
          lightGray: "#F3F3F1", // Light Gray
          mediumGray: "#E1E0D8", // Medium Gray
          darkGray: "#535953", // Dark Gray
        },
        border: "#e5e7eb", // Auth branch: border-gray-200
        input: "#d1d5db", // Auth branch: border-gray-300
        ring: "#16a34a", // Auth branch: green-600
        background: "#f9fafb", // Auth branch: bg-gray-50
        foreground: "#111827", // Auth branch: text-gray-900
        primary: {
          DEFAULT: "#00BE65", // Zeno Green (PMS 7481)
          50: "#E6FFF2",
          100: "#CCFFE6",
          200: "#99FFCC",
          300: "#66FFB3",
          400: "#33FF99",
          500: "#00BE65", // Main Zeno Green
          600: "#009E54",
          700: "#007E43",
          800: "#005E32",
          900: "#003E21",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#00BE65", // Zeno Green for accents
          50: "#E6FFF2",
          100: "#CCFFE6",
          500: "#00BE65",
          600: "#009E54",
          700: "#007E43",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#f3f4f6", // Auth branch: bg-gray-100
          foreground: "#111827", // Auth branch: text-gray-900
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#f3f4f6", // Auth branch: bg-gray-100
          foreground: "#4b5563", // Auth branch: text-gray-600
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "#ffffff", // Auth branch: bg-white
          foreground: "#111827", // Auth branch: text-gray-900
        },
      },
      // Zeno Typography - Updated as per Brand Guidelines 2023
      fontFamily: {
        'gotham': ['Gotham', 'Arial', 'sans-serif'],
        'gotham-black': ['Gotham Black', 'Arial Black', 'sans-serif'],
        'gotham-bold': ['Gotham Bold', 'Arial Bold', 'sans-serif'],
        'gotham-book': ['Gotham Book', 'Arial', 'sans-serif'],
        'dharma': ['Dharma Gothic C Heavy', 'Arial Black', 'sans-serif'],
        'sans': ['Gotham', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem', // 72px - Custom spacing for Zeno's 64px + padding
        '24': '6rem', // 96px
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  safelist: [
    // Preserve dynamic zeno-type classes
    'zeno-type-gpt',
    'zeno-type-platform', 
    'zeno-type-tool',
    'zeno-type-doc',
    'zeno-type-video',
    'zeno-type-fearless-u',
    'zeno-type-sharepoint',
    'zeno-type-learning-guide',
    'zeno-type-script',
    // Valid Tailwind classes being flagged as violations
    'placeholder-gray-500',
    'dark:placeholder-gray-400',
    'whitespace-nowrap',
    'whitespace-normal',
    'transform',
    '-translate-y-1/2',
    'hover:-translate-y-1',
    'group',
    'snap-x',
    'snap-mandatory',
    'snap-start',
    'list-disc',
    'list-inside',
    'list-decimal',
  ],
  plugins: [require("tailwindcss-animate")],
}

export default config
