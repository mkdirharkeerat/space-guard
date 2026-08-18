/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: "#040711",
          900: "#070C18",
          850: "#0B1222",
          800: "#0F182C",
          700: "#1E293B",
          600: "#334155",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
        },
        telemetry: {
          emerald: "#10B981",
          green: "#05DF72",
          cyan: "#06B6D4",
          blue: "#3B82F6",
          amber: "#F59E0B",
          red: "#EF4444",
          crimson: "#DC2626",
          border: "rgba(255, 255, 255, 0.1)",
          borderLight: "rgba(255, 255, 255, 0.16)",
          borderActive: "rgba(16, 185, 129, 0.4)",
        }
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Menlo', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
