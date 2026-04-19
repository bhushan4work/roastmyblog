import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#de7356',
        'brand-dark': '#de7356',
        surface: '#0a0a0a',
        'surface-light': '#141414',
        'surface-lighter': '#1e1e1e',
        border: '#2a2a2a',
        text: '#e5e5e5',
        'text-dim': '#888888',
      },
      fontFamily: {
        sans: ["'Space Grotesk', system-ui, sans-serif"],
        mono: 'monospace',
      },
    },
  },
  plugins: [],
};

export default config;
