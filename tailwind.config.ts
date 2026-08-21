import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#0876bd",
        "brand-dark": "#06263d",
        accent: "#f5bb31",
        "surface-tint": "#e8f2f2",
        "surface-sand": "#f2eee3",
        ink: "#102b3f",
        success: "#25855a",
        muted: "#657784",
      },
    },
  },
  plugins: [],
};

export default config;
