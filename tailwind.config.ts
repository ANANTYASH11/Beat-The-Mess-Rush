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
        display: ['"Bebas Neue"', 'var(--font-condensed)', 'Anton', 'sans-serif'],
        condensed: ['"Bebas Neue"', 'var(--font-condensed)', 'Anton', 'sans-serif'],
        accent: ['"Fraunces"', 'var(--font-accent)', 'Georgia', 'serif'],
        serif: ['"Fraunces"', 'var(--font-accent)', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'var(--font-mono)', 'monospace'],
        body: ['"Inter"', 'var(--font-body)', 'system-ui', 'sans-serif'],
        handwriting: ['"Caveat"', 'var(--font-handwriting)', 'cursive'],
      },
      maxWidth: {
        content: '1280px',
      },
      boxShadow: {
        'offset-xs': 'var(--shadow-offset-xs, 1px 1px 0px #14110F)',
        'offset-sm': 'var(--shadow-offset-sm, 2px 2px 0px #14110F)',
        'offset-md': 'var(--shadow-offset-md, 3px 3px 0px #14110F)',
        'offset-lg': 'var(--shadow-offset-lg, 4px 4px 0px #14110F)',
        'offset-xl': 'var(--shadow-offset-xl, 6px 6px 0px #14110F)',
        'brutal-xs': 'var(--shadow-offset-xs, 1px 1px 0px #14110F)',
        'brutal-sm': 'var(--shadow-offset-sm, 2px 2px 0px #14110F)',
        'brutal-md': 'var(--shadow-offset-md, 3px 3px 0px #14110F)',
        'brutal-lg': 'var(--shadow-offset-lg, 4px 4px 0px #14110F)',
        'brutal-xl': 'var(--shadow-offset-xl, 6px 6px 0px #14110F)',
      },
    },
  },
  plugins: [],
};
export default config;
