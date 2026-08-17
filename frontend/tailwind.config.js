/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: "#FAF8F5",
          paper: "#FFFFFF",
          cream: "#F4EFE6",
          dark: "#0F1117",
          black: "#000000",
          yellow: "#FFE600",
          green: "#00FF66",
          emerald: "#10B981",
          pink: "#FF4D8D",
          purple: "#9D4EDD",
          cyan: "#00E5FF",
          blue: "#2563EB",
          orange: "#FF6B00",
          red: "#FF3333",
          border: "#000000",
        }
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo': '4px 4px 0px 0px #000000',
        'neo-lg': '6px 6px 0px 0px #000000',
        'neo-xl': '8px 8px 0px 0px #000000',
        'neo-white': '4px 4px 0px 0px #FFFFFF',
        'neo-yellow': '4px 4px 0px 0px #FFE600',
        'neo-green': '4px 4px 0px 0px #00FF66',
        'neo-red': '4px 4px 0px 0px #FF3333',
        'neo-cyan': '4px 4px 0px 0px #00E5FF',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      fontFamily: {
        sans: ['"Syne"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['"Syne Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
