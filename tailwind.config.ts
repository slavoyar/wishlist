import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
        copy: 'var(--color-body)',
        muted: 'var(--color-muted)',
        faint: 'var(--color-faint)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        background: 'var(--color-bg)',
        foreground: 'var(--color-ink)',
        card: 'var(--color-surface)',
        'card-foreground': 'var(--color-ink)',
        popover: 'var(--color-surface)',
        'popover-foreground': 'var(--color-ink)',
        secondary: 'var(--color-surface)',
        'secondary-foreground': 'var(--color-ink)',
        accent: 'var(--color-surface)',
        'accent-foreground': 'var(--color-primary)',
        destructive: 'oklch(0.55 0.18 25)',
        'destructive-foreground': 'var(--color-ink)',
        input: 'var(--color-border)',
        ring: 'var(--color-primary)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: [
          'var(--text-display)',
          { lineHeight: 'var(--leading-display)', letterSpacing: 'var(--tracking-display)' },
        ],
        heading: ['var(--text-heading)', { lineHeight: 'var(--leading-heading)' }],
        subheading: ['var(--text-subheading)', { lineHeight: 'var(--leading-heading)' }],
        body: ['var(--text-body)', { lineHeight: 'var(--leading-body)' }],
        'body-lg': ['var(--text-body-lg)', { lineHeight: 'var(--leading-body)' }],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
