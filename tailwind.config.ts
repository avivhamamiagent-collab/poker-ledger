import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#041710',
        surface: '#041710',
        'surface-dim': '#041710',
        'surface-bright': '#293d35',
        'surface-container-lowest': '#01110b',
        'surface-container-low': '#0b1f18',
        'surface-container': '#10231c',
        'surface-container-high': '#1a2e26',
        'surface-container-highest': '#253931',
        'surface-variant': '#253931',

        primary: '#a5d0b9',
        'primary-container': '#1b4332',
        'primary-fixed': '#c1ecd4',
        'primary-fixed-dim': '#a5d0b9',
        'on-primary': '#0e3727',
        'on-primary-container': '#86af99',
        'on-primary-fixed': '#002114',
        'on-primary-fixed-variant': '#274e3d',

        secondary: '#95d4b3',
        'secondary-container': '#12533a',
        'secondary-fixed': '#b1f0ce',
        'secondary-fixed-dim': '#95d4b3',
        'on-secondary': '#003824',
        'on-secondary-container': '#87c6a5',
        'on-secondary-fixed': '#002114',
        'on-secondary-fixed-variant': '#0e5138',

        tertiary: '#e9c349',
        'tertiary-container': '#cba72f',
        'tertiary-fixed': '#ffe088',
        'tertiary-fixed-dim': '#e9c349',
        'on-tertiary': '#3c2f00',
        'on-tertiary-container': '#4e3d00',
        'on-tertiary-fixed': '#241a00',
        'on-tertiary-fixed-variant': '#574500',

        error: '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',

        outline: '#8b938d',
        'outline-variant': '#414844',

        'on-background': '#d1e8dc',
        'on-surface': '#d1e8dc',
        'on-surface-variant': '#c1c8c2',

        'surface-tint': '#a5d0b9',
        'inverse-surface': '#d1e8dc',
        'inverse-on-surface': '#21342c',
        'inverse-primary': '#3f6653',
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          '2xl': '1280px',
        },
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      spacing: {
        base: '4px',
        'touch-target': '48px',
        'container-padding': '20px',
        'section-margin': '32px',
        'stack-gap': '12px',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        'headline-md': ['Inter'],
        'data-tabular': ['Inter'],
        'display-currency': ['Inter'],
        'body-lg': ['Inter'],
        'label-caps': ['Inter'],
        'body-sm': ['Inter'],
        'headline-lg': ['Inter'],
      },
      fontSize: {
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'data-tabular': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'display-currency': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '700' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'headline-lg': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
      },

      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        chipBounce: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '35%': { transform: 'translateY(-10px) scale(1.02)' },
          '70%': { transform: 'translateY(0) scale(0.99)' },
          '100%': { transform: 'translateY(-2px) scale(1)' },
        },
        cardSlideIn: {
          '0%': { transform: 'translateX(24px) rotate(2deg)', opacity: '0' },
          '100%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
        },
        numberPop: {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(233,195,73,.18), 0 12px 25px rgba(233,195,73,.08)' },
          '50%': { boxShadow: '0 0 0 1px rgba(233,195,73,.32), 0 16px 35px rgba(233,195,73,.14)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        chipBounce: 'chipBounce 520ms cubic-bezier(.2,.9,.2,1) both',
        cardSlideIn: 'cardSlideIn 220ms ease-out both',
        numberPop: 'numberPop 180ms ease-out both',
        goldPulse: 'goldPulse 1.8s ease-in-out infinite',
        fadeIn: 'fadeIn 200ms ease-out both',
        slideUp: 'slideUp 220ms ease-out both',
      },

    },
  },
  plugins: [],
} satisfies Config
