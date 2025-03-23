/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff', // Very light blue
          100: '#e0f2fe', // Light blue
          200: '#bae6fd', // Lighter blue
          300: '#7dd3fc', // Light blue
          400: '#38bdf8', // Base primary color
          500: '#0ea5e9', // Slightly darker blue
          600: '#0284c7', // Darker blue
          700: '#0369a1', // Even darker blue
          800: '#075985', // Dark blue
          900: '#0c4a6e', // Very dark blue
        },
      },
      // You can add other theme extensions here
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      // Add more custom theme extensions as needed
    },
  },
  plugins: [
    // Add any Tailwind plugins you're using
  ],
};
