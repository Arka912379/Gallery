/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        cream: '#F5F1E6',
        coral: { 400: '#FF6F6F', 500: '#FF5555', 600: '#F13F3F' },
      },
      boxShadow: {
        brutal: '6px 6px 0 0 #000000',
        'brutal-sm': '4px 4px 0 0 #000000',
        'brutal-lg': '8px 8px 0 0 #000000',
        'brutal-dark': '6px 6px 0 0 #FFFFFF',
        'brutal-sm-dark': '4px 4px 0 0 #FFFFFF',
        'brutal-lg-dark': '8px 8px 0 0 #FFFFFF',
      },
    },
  },
  plugins: [],
};
