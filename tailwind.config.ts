import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00c2ff',
          50:  '#e6f8ff',
          100: '#ccf0ff',
          200: '#99e1ff',
          300: '#66d2ff',
          400: '#33c3ff',
          500: '#00c2ff',
          600: '#00a8e5',
          700: '#0089bd',
          800: '#006c95',
          900: '#004e6c'
        }
      }
    }
  },
  plugins: []
};

export default config;
