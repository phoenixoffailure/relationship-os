import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      fontFamily: {
        'sans': ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'serif': ['var(--font-merriweather)', 'ui-serif', 'Georgia', 'serif'],
        'heading': ['var(--font-merriweather)', 'serif'],
        'merriweather': ['var(--font-merriweather)', 'serif'],
      },
      colors: {
        // SHADCN BASE COLORS
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // BRAND COLORS
        brand: {
          'teal': '#4AB9B8',
          'dark-teal': '#257A7A', 
          'coral-pink': '#FF8A9B',
          'soft-teal': '#78B3B3',
          'light-coral': '#FFB3C1',
          'warm-peach': '#FFCB8A',
          'deep-teal': '#206B65',
          'highlight': '#FFDEEB',
          'warm-white': '#FFF8FB',
          'cool-gray': '#F5F7F7',
          'mint-green': '#B6F4F4',
          'charcoal': '#2A2D34',
          'slate': '#6E7288',
          'light-gray': '#E5E7EB',
        },
        
        // CALM COLORS (Updated to brand)
        calm: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#4AB9B8', // brand-teal
          600: '#257A7A', // brand-dark-teal
          700: '#206B65', // brand-deep-teal
          800: '#075985',
          900: '#0C4A6E',
        },

        // MINT COLORS (Updated to brand)
        mint: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#B6F4F4', // brand-mint-green
          600: '#78B3B3', // brand-soft-teal
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
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