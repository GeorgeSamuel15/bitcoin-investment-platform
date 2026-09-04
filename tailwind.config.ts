import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        'panel-2': 'var(--panel-2)',
        paper: 'var(--paper)',
        muted: 'var(--muted)',
        orange: 'var(--orange)',
        'orange-dim': 'var(--orange-dim)',
        green: 'var(--green)',
        red: 'var(--red)',
        line: 'var(--line)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
        body: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
};
export default config;
