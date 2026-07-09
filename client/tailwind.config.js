/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          light: "rgb(var(--primary-light))",
          DEFAULT: "rgb(var(--primary-color))",
          dark: "rgb(var(--primary-hover))",
        },
        blue: {
          50: "rgb(var(--primary-light))",
          100: "rgb(var(--primary-light))",
          500: "rgb(var(--primary-color))",
          600: "rgb(var(--primary-color))",
          700: "rgb(var(--primary-hover))",
        },
        "background-light": "rgb(var(--bg-page))",
        "background-dark": "rgb(var(--bg-page))",
        "surface-dark": "rgb(var(--bg-card))",
        "surface": "rgb(var(--bg-card))",
      },
      fontFamily: {
        display: ["Lexend", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
};
