/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#135bec',
        'background-light': '#f6f6f8',
        'background-dark': '#121212',
        'surface-dark': '#1E1E1E',
        'on-surface-dark': '#E0E0E0',
        'on-surface-secondary-dark': '#A8A8A8',
        'border-dark': '#2F2F2F',
      },
      fontFamily: {
        display: ['Inter', 'Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
