import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#14130F",
          surface: "#1D1B16",
          surface2: "#252219",
          border: "#2E2B24",
          text: "#F2EFE8",
          muted: "#9C966A",
          faint: "#6B675C",
        },
        tungsten: {
          DEFAULT: "#E8542C",
          hover: "#F26A42",
          dim: "#7A3220",
        },
        status: {
          planned: "#6B675C",
          progress: "#D4A72C",
          ready: "#4C8FD9",
          posted: "#6B9E78",
          overdue: "#D9524C",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
