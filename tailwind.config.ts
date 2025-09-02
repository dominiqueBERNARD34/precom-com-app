import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#2dd4bf', // turquoise clair
          500: '#14b8a6', // turquoise "Maestra"
        },
      },
    },
  },
  plugins: [],
};
export default config;
