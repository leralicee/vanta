import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        vanta: '#0A0A0A',
        onyx: '#141414',
        graphite: '#222222',
        platinum: '#E8E8E8',
        steel: '#8A8A8A',
        champagne: '#C9A84C',
        'gold-hi': '#E3C977',
        'gold-lo': '#9A7B2E',
      },
      fontFamily: {

        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 11vw, 10rem)', { lineHeight: '0.95', letterSpacing: '0.04em' }],
        'display-l': ['clamp(2rem, 5vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '0.02em' }],
        'display-m': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.1' }],
        body: ['clamp(1.05rem, 1.4vw, 1.3rem)', { lineHeight: '1.7' }],
        'mono-label': ['0.72rem', { lineHeight: '1.4', letterSpacing: '0.2em' }],
        'mono-data': ['0.9rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
      },
      letterSpacing: {
        brand: '0.3em',
        wide: '0.2em',
      },
      spacing: {
        section: 'clamp(7rem, 14vh, 12rem)',
      },
      zIndex: {
        base: '10',
        raised: '20',
        overlay: '30',
        wipe: '40',
        hud: '50',
        nav: '60',
        cursor: '70',
      },
      transitionTimingFunction: {

        vanta: 'cubic-bezier(0.22, 1, 0.36, 1)',
        sweep: 'cubic-bezier(0.83, 0, 0.17, 1)',
      },
      transitionDuration: {
        slow: '800ms',
        slower: '1200ms',
      },
      backgroundImage: {

        'gold-sheen': 'linear-gradient(160deg, #E3C977 0%, #C9A84C 45%, #9A7B2E 100%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'sweep-in': {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
      },
      animation: {
        'fade-in': 'fade-in 1.2s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
