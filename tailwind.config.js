/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#070A0F',
          900: '#0B0F17',
          850: '#0F1622',
          800: '#151F30',
          700: '#1E2C42',
        },
        kobra: {
          neon: '#10B981',
          mint: '#34D399',
          glow: '#059669',
          dark: '#064E3B',
          amber: '#F59E0B',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
