/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9defe',
          300: '#7cc2fd',
          400: '#369ffa',
          500: '#0c7bf0',
          600: '#005ec9',
          700: '#00479b',
          800: '#00336d',
          900: '#051b3b',
          DEFAULT: '#0c7bf0'
        },
        slate: {
          850: '#151f32'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
