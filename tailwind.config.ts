import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--color-bg)',
          raised: 'var(--color-bg-raised)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          muted: 'var(--color-ink-muted)',
          faint: 'var(--color-ink-faint)',
        },
        saffron: {
          DEFAULT: 'var(--color-saffron)',
          hover: '#DD7A0E',
        },
        chilli: {
          DEFAULT: 'var(--color-chilli)',
        },
        turmeric: {
          DEFAULT: 'var(--color-turmeric)',
        },
        'curry-leaf': {
          DEFAULT: 'var(--color-curry-leaf)',
        },
        steel: {
          DEFAULT: 'var(--color-steel)',
          dark: 'var(--color-steel-dark)',
          light: 'var(--color-steel-light)',
        },
      },
      fontFamily: {
        condensed: ['var(--font-condensed)', 'Bebas Neue', 'Anton', 'sans-serif'],
        accent: ['var(--font-accent)', 'Fraunces', 'serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'monospace'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        handwriting: ['var(--font-handwriting)', 'Caveat', 'cursive'],
      },
      maxWidth: {
        content: '1280px',
      },
      boxShadow: {
        'offset-sm': 'var(--shadow-offset-sm, 2px 2px 0px #14110F)',
        'offset-md': 'var(--shadow-offset-md, 3px 3px 0px #14110F)',
        'offset-lg': 'var(--shadow-offset-lg, 4px 4px 0px #14110F)',
        'offset-xl': 'var(--shadow-offset-xl, 6px 6px 0px #14110F)',
      },
    },
  },
  plugins: [],
};
export default config;
