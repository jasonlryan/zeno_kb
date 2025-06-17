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
        // Zeno Brand Colors
        zeno: {
          green: "#04BB63", // Primary brand color
          black: "#000000", // Text color
          white: "#FFFFFF", // Background
          lightgray: "#F5F5F5", // Alt background
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#04BB63", // Zeno Green
          50: "#E6FFF2",
          100: "#CCFFE6",
          200: "#99FFCC",
          300: "#66FFB3",
          400: "#33FF99",
          500: "#04BB63", // Main Zeno Green
          600: "#039954",
          700: "#027745",
          800: "#015536",
          900: "#013327",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#04BB63", // Reused Zeno Green for accents
          50: "#E6FFF2",
          100: "#CCFFE6",
          500: "#04BB63",
          600: "#039954",
          700: "#027745",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F5F5F5", // Light grey alt background
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#F5F5F5", // Light grey
          foreground: "#666666",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Zeno Typography
      fontFamily: {
        'helios': ['Helios Antique', 'sans-serif'],
        'sans': ['Helios Antique', 'Inter', 'system-ui', 'sans-serif'],
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
  plugins: [require("tailwindcss-animate")],
}

export default config
