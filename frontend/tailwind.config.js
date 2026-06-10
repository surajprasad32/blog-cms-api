/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0c0c0c',
        surface: '#141414',
        card: '#1c1c1c',
        border: '#2a2a2a',
        primary: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
          dark: '#5b21b6',
        },
        accent: '#06b6d4',
        muted: '#71717a',
        subtle: '#a1a1aa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Crimson Pro"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'gradient': 'gradient 8s ease infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
      typography: {
        invert: {
          css: {
            '--tw-prose-body': '#e4e4e7',
            '--tw-prose-headings': '#fafafa',
            '--tw-prose-lead': '#a1a1aa',
            '--tw-prose-links': '#a78bfa',
            '--tw-prose-bold': '#fafafa',
            '--tw-prose-counters': '#71717a',
            '--tw-prose-bullets': '#71717a',
            '--tw-prose-hr': '#2a2a2a',
            '--tw-prose-quotes': '#e4e4e7',
            '--tw-prose-quote-borders': '#7c3aed',
            '--tw-prose-captions': '#71717a',
            '--tw-prose-code': '#a78bfa',
            '--tw-prose-pre-code': '#e4e4e7',
            '--tw-prose-pre-bg': '#1c1c1c',
            '--tw-prose-th-borders': '#2a2a2a',
            '--tw-prose-td-borders': '#1c1c1c',
          },
        },
      },
    },
  },
  plugins: [],
}
