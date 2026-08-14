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
        primary: {
          DEFAULT: "#1e3a5f",
          foreground: "#ffffff",
          50: "#f0f5fa",
          100: "#dce7f2",
          500: "#1e3a5f",
          600: "#1a3254",
          700: "#152a46",
        },
        secondary: {
          DEFAULT: "#7dd3fc",
          50: "#f0f9ff",
          100: "#e0f2fe",
          400: "#7dd3fc",
          500: "#38bdf8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
