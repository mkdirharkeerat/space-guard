/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#04070f",
        deep: "#070c18",
        panel: "rgba(7, 12, 24, 0.92)",
        card: "rgba(8, 14, 28, 0.95)",
        hud: {
          green: "#00ff88",
          emerald: "#05df72",
          dimGreen: "rgba(0, 255, 136, 0.15)",
          amber: "#ffb830",
          dimAmber: "rgba(255, 184, 48, 0.15)",
          red: "#ff3b3b",
          dimRed: "rgba(255, 59, 59, 0.15)",
          cyan: "#00e5ff",
          dimCyan: "rgba(0, 229, 255, 0.15)",
          border: "rgba(0, 255, 136, 0.2)",
          borderFaint: "rgba(0, 255, 136, 0.08)"
        }
      },
      fontFamily: {
        sans: ['"Syne"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['"Syne Mono"', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.6))' },
          '50%': { opacity: '0.4', filter: 'drop-shadow(0 0 2px rgba(0, 255, 136, 0.2))' },
        },
        radarSweep: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      }
    },
  },
  plugins: [],
}
