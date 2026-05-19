/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#071B53',
          night: '#071B53',
          mist: '#F4F6FA',
          line: '#e2e8f0',
          accent: '#071B53',
          accentSoft: '#EEF1F8',
        },
        support: {
          navy: '#071B53',
          'navy-hover': '#0B276F',
          tint: '#EEF1F8',
          mint: '#ECFDF5',
          'mint-text': '#065F46',
          'mint-border': '#A7F3D0',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 28px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};
