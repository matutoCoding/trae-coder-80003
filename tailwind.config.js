/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        lacquer: {
          50: "#FDF2F2",
          100: "#F9D9D9",
          200: "#F2B3B3",
          300: "#E88585",
          400: "#D95252",
          500: "#C93838",
          600: "#A82B2B",
          700: "#8B2323",
          800: "#6E1C1C",
          900: "#4A1212",
          950: "#2A0A0A",
        },
        gold: {
          50: "#FEF9EE",
          100: "#FBEFCB",
          200: "#F6DE95",
          300: "#ECC95A",
          400: "#E5B52E",
          500: "#D4A853",
          600: "#B88A3A",
          700: "#996E2E",
          800: "#7C5828",
          900: "#674924",
          950: "#3A2711",
        },
        ink: {
          50: "#F7F7F7",
          100: "#E3E3E3",
          200: "#C8C8C8",
          300: "#A4A4A4",
          400: "#818181",
          500: "#666666",
          600: "#515151",
          700: "#434343",
          800: "#383838",
          900: "#1A1A1A",
          950: "#0D0D0D",
        },
        ivory: {
          50: "#FDFBF5",
          100: "#F9F4E6",
          200: "#F0E7C9",
          300: "#E5D7A8",
          400: "#D9C485",
          500: "#C9AE5F",
          600: "#B59445",
          700: "#977639",
          800: "#795E32",
          900: "#634E2D",
          950: "#352817",
        },
      },
      fontFamily: {
        serif: ["'Noto Serif SC'", "'Songti SC'", "SimSun", "serif"],
        sans: ["'Noto Sans SC'", "'PingFang SC'", "Microsoft YaHei", "sans-serif"],
      },
      boxShadow: {
        'lacquer': '0 4px 20px -2px rgba(139, 35, 35, 0.3)',
        'gold': '0 4px 20px -2px rgba(212, 168, 83, 0.4)',
        'inset-gold': 'inset 0 1px 0 rgba(212, 168, 83, 0.3)',
      },
      backgroundImage: {
        'lacquer-gradient': 'linear-gradient(135deg, #8B2323 0%, #6E1C1C 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4A853 0%, #B88A3A 100%)',
        'ink-gradient': 'linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe': 'breathe 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
