import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ash: "#16140f",
        "ash-raised": "#1e1a14",
        "ember-line": "#2a241c",
        paper: "#efe9de",
        "paper-dim": "#a69c8a",
        flame: "#e8703a",
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)"],
        mono: ["var(--font-plex-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
