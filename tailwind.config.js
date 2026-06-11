/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'color-mix(in srgb, var(--color-primary) calc(<alpha-value> * 100%), transparent)',
        'primary-hover': 'color-mix(in srgb, var(--color-primary-hover) calc(<alpha-value> * 100%), transparent)',
        secondary: 'color-mix(in srgb, var(--color-secondary) calc(<alpha-value> * 100%), transparent)',
        'secondary-hover': 'color-mix(in srgb, var(--color-secondary-hover) calc(<alpha-value> * 100%), transparent)',
        success: 'color-mix(in srgb, var(--color-success) calc(<alpha-value> * 100%), transparent)',
        warning: 'color-mix(in srgb, var(--color-warning) calc(<alpha-value> * 100%), transparent)',
        danger: 'color-mix(in srgb, var(--color-danger) calc(<alpha-value> * 100%), transparent)',
        info: 'color-mix(in srgb, var(--color-info) calc(<alpha-value> * 100%), transparent)',
        
        background: 'color-mix(in srgb, var(--color-background) calc(<alpha-value> * 100%), transparent)',
        'background-secondary': 'color-mix(in srgb, var(--color-background-secondary) calc(<alpha-value> * 100%), transparent)',
        surface: 'color-mix(in srgb, var(--color-surface) calc(<alpha-value> * 100%), transparent)',
        'surface-hover': 'color-mix(in srgb, var(--color-surface-hover) calc(<alpha-value> * 100%), transparent)',
        
        text: {
          primary: 'color-mix(in srgb, var(--color-text-primary) calc(<alpha-value> * 100%), transparent)',
          secondary: 'color-mix(in srgb, var(--color-text-secondary) calc(<alpha-value> * 100%), transparent)',
          muted: 'color-mix(in srgb, var(--color-text-muted) calc(<alpha-value> * 100%), transparent)',
          inverse: 'color-mix(in srgb, var(--color-text-inverse) calc(<alpha-value> * 100%), transparent)',
        },
        
        border: {
          DEFAULT: 'color-mix(in srgb, var(--color-border) calc(<alpha-value> * 100%), transparent)',
          hover: 'color-mix(in srgb, var(--color-border-hover) calc(<alpha-value> * 100%), transparent)',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
        tooltip: 'var(--z-tooltip)',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
    require('@tailwindcss/typography'),
  ],
};
