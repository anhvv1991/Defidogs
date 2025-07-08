/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'jump-in': 'jump-in 0.5s ease-out forwards',
      },
      keyframes: {
        'jump-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
    fontFamily: {
      'sans': ['"Noto Sans"', 'sans-serif'],
      'secondary': ['"Silverado"', 'sans-serif'],
      'tertiary': ['"Cormorant"', 'sans-serif'],
    },
  },
  plugins: [],
}
