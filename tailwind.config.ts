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
        corporate: {
          dark: "#09090b",
          light: "#fafafa",
          accent: "#10b981", 
          warning: "#f59e0b", 
        }
      },
      boxShadow: {
        'glow-success': '0 0 10px rgba(16, 185, 129, 0.5)',
        'glow-warning': '0 0 10px rgba(245, 158, 11, 0.5)',
      }
    },
  },
  plugins: [],
};
export default config;
