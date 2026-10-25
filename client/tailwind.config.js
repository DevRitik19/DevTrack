/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F4F0E6',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#EAE2D3',
          hover: '#FAF6EE',
          active: '#EFE7DA',
        },
        card: {
          DEFAULT: '#FFFFFF',
          border: '#E3D5BD',
          borderHover: '#D4C4A8',
        },
        border: {
          DEFAULT: '#E3D5BD',
          subtle: '#EFE6D5',
          focus: '#B65F3B',
        },
        text: {
          primary: '#292C25',
          secondary: '#6E7167',
          muted: '#8A8D83',
          forest: '#263524',
        },
        earth: {
          bg: '#F4F0E6',
          forest: '#263524',
          terracotta: '#B65F3B',
          card: '#FFFFFF',
          secondary: '#EAE2D3',
          border: '#E3D5BD',
          secondaryText: '#6E7167',
          body: '#292C25',
        },
        accent: {
          terracotta: '#B65F3B',
          forest: '#263524',
          green: '#2D5A27',
          blue: '#3B6A82',
          cyan: '#367B7A',
          purple: '#6E4E37',
          amber: '#C27C2C',
          rose: '#B84A39',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(38, 53, 36, 0.05), 0 1px 2px -1px rgba(38, 53, 36, 0.03)',
        card: '0 2px 6px -1px rgba(38, 53, 36, 0.06), 0 1px 3px -1px rgba(38, 53, 36, 0.04)',
        glow: '0 0 15px -3px rgba(182, 95, 59, 0.15)',
        elevated: '0 10px 25px -5px rgba(38, 53, 36, 0.08), 0 8px 10px -6px rgba(38, 53, 36, 0.04)',
      }
    },
  },
  plugins: [],
}
