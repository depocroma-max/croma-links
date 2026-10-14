/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        croma: { black: '#0d0d0d', red: '#e8251a', bg: '#f7f7f5', line: '#ddddd8', soft: '#efefec' },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', '"Arial Narrow"', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
};
