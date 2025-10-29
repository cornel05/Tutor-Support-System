import { fontFamily } from 'tailwindcss/defaultTheme';

/\** @type {import('tailwindcss').Config} \*/
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      colors: {
        brand: {
          DEFAULT: '#003087',
          light: '#0f4ba8',
          dark: '#001b53',
        },
      },
      backgroundImage: {
        'hero-pattern': 'radial-gradient(circle at top, rgba(0,48,135,0.25), transparent 70%)',
      },
      boxShadow: {
        glow: '0 20px 45px -15px rgba(15, 75, 168, 0.45)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
