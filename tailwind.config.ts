import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0b",
          surface: "#111113",
          card: "#16161a",
          hover: "#1c1c21",
          input: "#1a1a1f",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.07)",
          md: "rgba(255,255,255,0.11)",
          strong: "rgba(255,255,255,0.18)",
        },
        text: {
          primary: "#f0eff4",
          secondary: "#8e8d9a",
          tertiary: "#55545f",
        },
        accent: {
          DEFAULT: "#7c6af7",
          dim: "rgba(124,106,247,0.15)",
        },
        success: "#34c97a",
        danger: "#f05252",
        warning: "#f0a050",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
