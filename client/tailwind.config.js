/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Three‑color human‑focused palette (non‑primary)
        deepTeal: "#0d3b66",
        softAmber: "#ffb400",
        mutedSlate: "#6b7280",
      },
    },
  },
  plugins: [],
};
