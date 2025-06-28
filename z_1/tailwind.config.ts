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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
  plugins: [require("tailwindcss-animate")],
}

export default config
