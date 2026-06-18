/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#faf5f4',
          100: '#f5ebe8',
          200: '#edd5d5',
          300: '#e0b4b4',
        },
        rose: {
          soft: '#f5d0d0',
          muted: '#e8a8a8',
          deep: '#dc2626',
          wine: '#991b1b',
        },
        emerald: {
          btn: '#dc2626',
          'btn-hover': '#b91c1c',
          'btn-light': '#fecaca',
        },
        hospital: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      borderRadius: {
        btn: '1rem',
        card: '1.25rem',
      },
      boxShadow: {
        interactive: '0 3px 10px rgba(185, 28, 28, 0.15)',
        'interactive-hover': '0 6px 18px rgba(185, 28, 28, 0.22)',
        btn: '0 4px 12px rgba(220, 38, 38, 0.35)',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
