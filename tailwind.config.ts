import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        sand: "#F7F3EC",
        clay: "#B45309",
        moss: "#14532D",
        ember: "#991B1B",
        ocean: "#0F4C5C"
      },
      boxShadow: {
        panel: "0 24px 60px rgba(17, 24, 39, 0.08)"
      },
      fontFamily: {
        sans: ["Aptos", "\"Segoe UI\"", "\"Helvetica Neue\"", "Arial", "sans-serif"],
        mono: ["\"Cascadia Code\"", "\"IBM Plex Mono\"", "Consolas", "\"SFMono-Regular\"", "monospace"]
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(17,24,39,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.05) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
