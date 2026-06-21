import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cm: {
          bg: "#0b0f19",
          bg2: "#131929",
          bg3: "#1a2235",
          border: "#242f45",
          text: "#dde4f0",
          muted: "#6b7a99",
          mint: "#00e5a0",
          cyan: "#38bdf8",
          amber: "#fbbf24",
          rose: "#f87171",
          purple: "#a78bfa",
          orange: "#fb923c",
          green: "#22c55e",
          slate: "#7c93c0",
        },
      },
      fontFamily: {
        mono: ["'Geist Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
