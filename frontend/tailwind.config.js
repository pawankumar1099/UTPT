/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        border: 'rgba(255, 255, 255, 0.1)',
        input: 'rgba(255, 255, 255, 0.05)',
        ring: 'hsl(199, 89%, 48%)',
        background: 'hsl(220, 20%, 97%)',
        foreground: 'hsl(224, 71%, 4%)',
        primary: {
          DEFAULT: '#0071e3',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'rgba(0, 0, 0, 0.04)',
          foreground: '#1d1d1f',
        },
        muted: {
          DEFAULT: 'rgba(0, 0, 0, 0.04)',
          foreground: '#86868b',
        },
        accent: {
          DEFAULT: 'rgba(255, 255, 255, 0.2)',
          foreground: '#0071e3',
        },
        destructive: {
          DEFAULT: 'hsl(0 84.2% 60.2%)',
          foreground: 'hsl(210 40% 98%)',
        },
        card: {
          DEFAULT: 'rgba(255, 255, 255, 0.7)',
          foreground: '#1d1d1f',
        },
        sidebar: {
          DEFAULT: 'rgba(255, 255, 255, 0.5)',
          foreground: '#1d1d1f',
          accent: 'rgba(0, 113, 227, 0.1)',
        },
      },
      borderRadius: {
        lg: '1.25rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.04)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"DM Sans"', 'sans-serif'],
        subheading: ['"Plus Jakarta Sans"', 'sans-serif'],
        stats: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
