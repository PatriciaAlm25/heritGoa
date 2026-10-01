/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
      },
      colors: {
        // Heritage Intelligence Design System
        navy:       { DEFAULT: '#0a1628', 50: '#f0f4ff', 100: '#e0e8ff', 900: '#0a1628' },
        gold:       { DEFAULT: '#d4af37', light: '#e8c94a', dark: '#a8892a', muted: 'rgba(212,175,55,0.15)' },
        terracotta: { DEFAULT: '#c2714f', light: '#d4856a', dark: '#9e5a3d' },
        ivory:      { DEFAULT: '#f5f0e8', warm: '#ede5d5' },
        heritage: {
          green:  '#2d6a4f',
          dark:   '#0f1419',
          surface:'#1a2332',
          border: 'rgba(212,175,55,0.15)',
          text:   '#e8e0d0',
          muted:  '#8a9bb0',
        }
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'marquee':    'marquee 30s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'gold':     '0 0 0 1px rgba(212,175,55,0.3), 0 4px 24px rgba(212,175,55,0.15)',
        'heritage': '0 8px 32px rgba(0,0,0,0.4)',
        'card':     '0 2px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(212,175,55,0.1)',
      }
    },
  },
  plugins: [],
}
