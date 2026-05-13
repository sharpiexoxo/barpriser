import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      colors: {
        brand: {
          DEFAULT: "#C94E2A",
          light: "#F7EDE8",
          mid: "#E8795A",
          dark: "#7A2A12",
        },
        ink: {
          DEFAULT: "#1A1714",
          2: "#4A4540",
          3: "#8A837C",
        },
        surface: {
          DEFAULT: "#FDFAF7",
          2: "#F2EDE7",
          3: "#E8E0D8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
