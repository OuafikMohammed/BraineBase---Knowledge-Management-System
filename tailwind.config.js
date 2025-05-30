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
    extend: {      colors: {
        border: "#e2e8f0",
        input: "#f8fafc",
        ring: "#7b4fff",
        background: "#ffffff",
        foreground: "#1a1333",
        surface: "#f8fafc",
        primary: {
          DEFAULT: "#7b4fff",
          foreground: "#ffffff",
          hover: "#6b3ee6"
        },
        secondary: {
          DEFAULT: "#f1f5f9",
          foreground: "#1a1333"
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff"
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b"
        },
        accent: {
          DEFAULT: "#7b4fff",
          foreground: "#ffffff"
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#1a1333"
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1a1333"
        },
        text: {
          primary: "#1a1333",
          secondary: "#64748b"
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
