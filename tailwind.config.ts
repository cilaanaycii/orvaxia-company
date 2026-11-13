import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        brand: {
          slate: '#606C8D',      // Bru Slate
          lavender: '#A99AB3',   // Lavender
          yellow: '#FDF5AE',     // Pastel Yellow
          peach: '#D0A9A0',      // Dusty Peach (corrected verified hex)
          navy: '#1A2238',       // Contrast deep navy slate
          cream: '#FAF8F5',      // Soft natural textile cream
          surface: '#F4F2F7',    // Light lavender gray
          muted: '#8E94A5',      // Neutral slate
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Bricolage Grotesque', 'sans-serif'],
        serif: ['var(--font-serif)', 'Noto Serif Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        'pill': '9999px',
      },
      boxShadow: {
        'brand': '0 10px 30px -10px rgba(96, 108, 141, 0.15)',
        'brand-sm': '0 2px 8px -2px rgba(26, 34, 56, 0.06), 0 1px 3px -1px rgba(26, 34, 56, 0.04)',
        'brand-md': '0 8px 24px -4px rgba(26, 34, 56, 0.08), 0 4px 8px -2px rgba(26, 34, 56, 0.03)',
        'brand-lg': '0 20px 40px -12px rgba(96, 108, 141, 0.18), 0 2px 6px 0 rgba(26, 34, 56, 0.04)',
        'dock': '0 20px 40px -10px rgba(26, 34, 56, 0.25), 0 0 1px 1px rgba(255, 255, 255, 0.2)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
