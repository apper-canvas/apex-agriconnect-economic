/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f3',
          100: '#dcf2e0',
          200: '#bce5c7',
          300: '#8fcfa3',
          400: '#5bb177',
          500: '#3d9355',
          600: '#2d5016',
          700: '#2d5016',
          800: '#1e3510',
          900: '#172b0d',
        },
        secondary: {
          50: '#f8faf8',
          100: '#f0f4f0',
          200: '#dce8dc',
          300: '#c4d6c4',
          400: '#8fbc8f',
          500: '#78a578',
          600: '#5e8a5e',
          700: '#4f7050',
          800: '#425942',
          900: '#384a39',
        },
        accent: {
          50: '#fff5e6',
          100: '#ffebcc',
          200: '#ffd699',
          300: '#ffbe66',
          400: '#ffa533',
          500: '#ff8c00',
          600: '#e67e00',
          700: '#cc7000',
          800: '#b36200',
          900: '#995400',
        },
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}