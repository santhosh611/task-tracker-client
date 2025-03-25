/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#4CAF50',
          'primary-hover': '#45a049',
          secondary: '#2196F3',
          danger: '#f44336',
          success: '#4CAF50',
          warning: '#FFC107',
          info: '#2196F3',
          light: '#f4f4f4',
          dark: '#333'
        },
      },
    },
    plugins: [],
  }