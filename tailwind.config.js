/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HCDC Red theme
        hcdc: '#C41E3A',
        'hcdc-dark': '#A01830',
        'hcdc-deeper': '#7D1226',
        'hcdc-soft': '#FDF2F4',
        'hcdc-muted': '#F5D0D6',
        // Blue for buttons/actions
        primary: '#1A56DB',
        'primary-dark': '#1446B8',
        'primary-soft': '#EEF3FD',
        // Neutrals
        surface: '#FFFFFF',
        'surface-2': '#F8F9FB',
        'surface-3': '#F1F4F9',
        border: '#E5E9F0',
        'text-main': '#0F172A',
        'text-sub': '#64748B',
        'text-hint': '#94A3B8',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'sidebar': '4px 0 24px rgba(0,0,0,0.06)',
        'card': '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      }
    },
  },
  plugins: [],
}