// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',   // si vous avez encore /pages
  ],
  theme: {
    extend: {
      colors: {
        // Turquoise PRECOM‑COM
        brand: '#05C6D1',
      },
    },
  },
  plugins: [
    // Optionnel : formulaires plus jolis
    // require('@tailwindcss/forms'),
  ],
};

export default config;
