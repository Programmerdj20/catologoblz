/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbf0',
          100: '#fff6e0',
          200: '#ffecb8',
          300: '#ffdd88',
          400: '#ffc94a',
          500: '#f6b01a',
          600: '#d9980a',
          700: '#b67706',
          800: '#8f5604',
          900: '#6b3b02'
        },
        accent: {
          50: '#fffdf8',
          100: '#fffaf5'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
};