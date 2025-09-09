import daisyui from "daisyui";
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        mentalos: {
          /* Cursor-inspired muted dark palette */
          "primary": "#38bdf8",   /* sky-400 */
          "secondary": "#a78bfa", /* violet-400 */
          "accent": "#4ade80",    /* lime-400 */
          "neutral": "#0f172a",   /* slate-900 */
          "base-100": "#0c111b", /* darker slate */
          "base-200": "#111827", /* slate-800 */
          "base-300": "#1e293b", /* slate-700 */
          "info": "#0ea5e9",
          "success": "#22c55e",
          "warning": "#fbbf24",
          "error": "#ef4444",
        },
      },
      "night",
    ],
  },
}

