/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        // Primary brand color from stitch designs
        primary: {
          DEFAULT: '#FF5200',
          light: '#FF7433',
          dark: '#CC4100',
        },
        // Status colors
        success: {
          DEFAULT: '#22C55E',
          light: '#4ADE80',
          dark: '#16A34A',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBB042',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        // Semantic background colors
        background: {
          light: '#F9FAFB',
          dark: '#1F2937',
        },
      },
      borderRadius: {
        'hb': '2.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'primary': '0 10px 20px -5px rgba(255, 82, 0, 0.2)',
      },
      minHeight: {
        'touch': '44px', // Mobile touch target
      },
      minWidth: {
        'touch': '44px', // Mobile touch target
      },
    },
  },
  plugins: [],
}