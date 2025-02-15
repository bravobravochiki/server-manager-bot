/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          background: '#121212',
          surface: '#1E1E1E',
          elevated: '#2D2D2D',
          border: '#333333',
          text: {
            primary: '#FFFFFF',
            secondary: '#B3B3B3',
            disabled: '#737373'
          },
          primary: '#BB86FC',
          secondary: '#3700B3',
          error: '#CF6679'
        }
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
      },
      spacing: {
        'mobile-header': '48px',
        'mobile-input': '40px',
        'mobile-button': '40px',
        'mobile-icon': '20px',
      },
      fontSize: {
        'mobile-xs': '11px',
        'mobile-sm': '12px',
        'mobile-base': '14px',
        'mobile-lg': '16px',
        'mobile-xl': '18px',
      },
      screens: {
        'xs': '320px',
        'sm': '428px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};