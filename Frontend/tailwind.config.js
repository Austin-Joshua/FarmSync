/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Agriculture-inspired green & earth-tone palette
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50: '#faf7f2',
          100: '#f5ede0',
          200: '#e8d4b8',
          300: '#d9b88a',
          400: '#c99a5c',
          500: '#b8823d',
          600: '#9d6b2f',
          700: '#7d5528',
          800: '#664524',
          900: '#553b1f',
        },
      },
    },
  },
  plugins: [],
};
