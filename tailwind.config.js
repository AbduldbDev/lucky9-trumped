/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        felt:  { DEFAULT: '#0c3d22', dark: '#071f11', light: '#124d2c', rim: '#8B6914' },
        gold:  { DEFAULT: '#c9a84c', light: '#e2c97e', dim: '#7a6028', faint: '#3a2d10' },
        ivory: { DEFAULT: '#f5f0e8', dim: '#c8c0aa' },
        chip:  { red: '#c0392b', blue: '#2471a3', black: '#1a1a1a' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'felt':  'inset 0 0 80px rgba(0,0,0,0.55), 0 0 0 6px #8B6914, 0 0 0 10px #5a4010',
        'card':  '0 2px 8px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)',
        'gold':  '0 0 16px rgba(201,168,76,0.4)',
        'seat':  '0 4px 24px rgba(0,0,0,0.6)',
      },
      keyframes: {
        deal: {
          '0%':   { transform: 'translateY(-24px) scale(0.9)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)',       opacity: '1' },
        },
        glow: {
          '0%,100%': { opacity: '0.7' },
          '50%':     { opacity: '1'   },
        },
        beat: {
          '0%,100%': { transform: 'scale(1)' },
          '30%':     { transform: 'scale(1.18)' },
          '60%':     { transform: 'scale(0.96)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
        countdownPop: {
          '0%':   { transform: 'scale(0.3)', opacity: '0' },
          '40%':  { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)',   opacity: '0.85' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
      animation: {
        deal:    'deal 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        glow:    'glow 2s ease-in-out infinite',
        beat:    'beat 0.7s ease-in-out infinite',
        fadeUp:  'fadeUp 0.3s ease-out',
        countdownPop: 'countdownPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};
