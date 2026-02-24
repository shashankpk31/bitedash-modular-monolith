export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': '375px',      // Small phones
        'sm': '640px',      // Tailwind default
        'md': '768px',      // Tablets
        'lg': '1024px',     // Desktop
        'xl': '1280px',     // Large desktop
        '2xl': '1536px',    // Extra large
      },
      colors: {
        brand: {
          primary: "#FA8112",    // Primary Orange (from logo)
          secondary: "#DF7F14",  // Darker Orange
          light: "#FF8E00",      // Light Orange accent
          dark: "#222222",       // Dark text/elements
        },
        cream: {
          50: "#FAF3E1",         // Warm cream (main background)
          100: "#F5E7C6",        // Light cream
          200: "#F9CA76",        // Golden cream
          300: "#F8C977",        // Light golden
        },
        food: {
          red: "#FF5319",        // Red vegetables
          orange: "#FF8E00",     // Orange vegetables
          yellow: "#FCC219",     // Yellow vegetables
          golden: "#F5B03E",     // Golden vegetables
        },
        status: {
          success: "#22c55e",
          error: "#FF5319",      // Using food red for errors
          pending: "#FCC219",    // Using food yellow for pending
          info: "#FA8112",       // Using brand primary
        },
        surface: {
          card: "#FEFEFE",       // Near white
          bg: "#FAF3E1",         // Warm cream background
          border: "#F5E7C6",     // Light cream border
          gray: {
            light: "#D9D9D9",    // Light gray
            DEFAULT: "#D4D4D3",  // Gray
            medium: "#B0B0B0",   // Medium gray
          }
        }
      },
      borderRadius: {
        'hb': '2.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}