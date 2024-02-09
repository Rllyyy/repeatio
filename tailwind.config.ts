import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
          },
        },
      }),
      colors: {
        prime: "rgb(90, 90, 245)",
        secondary: "rgb(40, 42, 57)",
        tertiary: "rgb(245, 245, 245)",
        "prime-dark": "rgb(63, 63, 219)",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1792px",
      "4xl": "2048px",
    },
  },
  plugins: [require("@tailwindcss/typography")],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;
