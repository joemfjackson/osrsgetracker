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
        background: "#1a1a1a",
        surface: "#252525",
        border: "#333333",
        foreground: "#e0e0e0",
        muted: "#888888",
        gold: "#ff981f",
        profit: "#00ff00",
        loss: "#ff4444",
      },
    },
  },
  plugins: [],
};
export default config;
