/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        navy: {
          900: '#070E1A',
          800: '#0A1628',
          700: '#0F1F3D',
          600: '#132040',
          500: '#1A2D55',
        },
        teal: {
          400: '#2DD4BF',
          500: '#00C9A7',
          600: '#00A882',
        },
        coral: {
          400: '#FF7B7B',
          500: '#FF5252',
          600: '#E03E3E',
        },
        pill: {
          red:    '#FF6B6B',
          blue:   '#4A90D9',
          yellow: '#FFD93D',
          green:  '#6BCB77',
          purple: '#B48ACA',
          orange: '#FF9F43',
          pink:   '#FF6EB4',
          cyan:   '#48CAE4',
        }
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-14px) rotate(6deg)' },
          '66%':      { transform: 'translateY(-7px) rotate(-4deg)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(14px) rotate(-6deg)' },
          '66%':      { transform: 'translateY(7px) rotate(4deg)' },
        },
        'pill-pulse': {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%':      { opacity: '1',    transform: 'scale(1.05)' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'float':          'float 6s ease-in-out infinite',
        'float-reverse':  'float-reverse 7s ease-in-out infinite',
        'float-slow':     'float 9s ease-in-out infinite',
        'pill-pulse':     'pill-pulse 3s ease-in-out infinite',
        'fade-in-up':     'fade-in-up 0.5s ease-out forwards',
        'fade-in':        'fade-in 0.4s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
        'shimmer':        'shimmer 2.5s linear infinite',
        'spin-slow':      'spin-slow 8s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
