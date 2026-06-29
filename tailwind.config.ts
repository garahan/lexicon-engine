import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, calm "Ascend" palette (light-first)
        cream: "#fbf7f0",
        ink: "#2b2433",
        brand: {
          50: "#fff1ec",
          100: "#ffe0d4",
          200: "#ffc1aa",
          300: "#ff9b76",
          400: "#fb7a4d",
          500: "#f25c2a",
          600: "#dd4316",
          700: "#b73312",
        },
        grape: {
          400: "#9b6dff",
          500: "#7c4dff",
          600: "#6a3de8",
        },
        mint: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        gold: "#f59e0b",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(43, 36, 51, 0.18)",
        "glow-correct": "0 0 0 4px rgba(16, 185, 129, 0.18)",
        "glow-combo": "0 0 24px rgba(124, 77, 255, 0.55)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        floatUp: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-46px)", opacity: "0" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        pop: "pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        floatUp: "floatUp 0.9s ease-out forwards",
        shake: "shake 0.4s ease-in-out",
        shimmer: "shimmer 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
