/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#2b2b2b',
          input: '#1a1a1a',
          accent: '#fcc636',
        }
      },
      fontFamily: {
        'sans': ['Hanken Grotesk', 'Hanken Grotesk Fallback', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brand': '2px 2px 0px 0 rgba(0,0,0,0.5)',
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        matchmyresume: {
          "primary": "#fcc636",
          "secondary": "#1a1a1a",
          "accent": "#fcc636",
          "neutral": "#1a1a1a",
          "base-100": "#2b2b2b",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
      "light",
      "dark",
    ],
  },
}