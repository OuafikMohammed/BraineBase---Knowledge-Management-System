/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
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
        border: {
          DEFAULT: "hsl(var(--border))",
          light: "#e2e8f0"
        },
        input: {
          DEFAULT: "hsl(var(--input))",
          light: "#f8fafc"
        },
        ring: {
          DEFAULT: "hsl(var(--ring))",
          light: "#7b4fff"
        },
        background: {
          DEFAULT: "hsl(var(--background))",
          light: "#ffffff"
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          light: "#1a1333"
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          light: "#f8fafc"
        },
        primary: {
          DEFAULT: "#7b4fff",
          foreground: "#ffffff",
          hover: "#a67cfc",
          light: {
            DEFAULT: "#7b4fff",
            foreground: "#ffffff",
            hover: "#6b3ee6"
          }
        },
        secondary: {
          DEFAULT: "#a0a0c0",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ff4f4f",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1a1333",
          foreground: "#a0a0c0",
        },
        accent: {
          DEFAULT: "#7b4fff",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#1a1333",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#1a1333",
          foreground: "#ffffff",
        },
        text: {
          primary: "#ffffff",
          secondary: "#a0a0c0",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fadeIn': 'fadeIn 0.5s ease-out',
        'slideUp': 'slideUp 0.5s ease-out',
        'rotate': 'rotate 1s ease-in-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
