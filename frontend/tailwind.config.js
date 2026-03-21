/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      // Responsive breakpoints
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      // BiteDash Vibrant Food Palette - Clean & Modern
      colors: {
        // Primary - VIBRANT Orange (#FA8112 - main logo, bold, appetizing!)
        'primary': '#FA8112',
        'primary-container': '#FFF4E8',     // Very light orange tint
        'primary-dim': '#E87510',           // Slightly darker for hover
        'primary-fixed': '#FFF4E8',
        'primary-fixed-dim': '#FFE8D6',
        'on-primary': '#FFFFFF',
        'on-primary-container': '#222222',
        'on-primary-fixed': '#222222',
        'on-primary-fixed-variant': '#E87510',
        'inverse-primary': '#FFB366',

        // Secondary - Deep Orange (#DF7F14 - rich, warm accent)
        'secondary': '#DF7F14',
        'secondary-dim': '#C97012',
        'secondary-container': '#FFF0E0',
        'secondary-fixed': '#FFF0E0',
        'secondary-fixed-dim': '#FFE4CC',
        'on-secondary': '#FFFFFF',
        'on-secondary-container': '#222222',
        'on-secondary-fixed': '#222222',
        'on-secondary-fixed-variant': '#C97012',

        // Tertiary - Golden Yellow (#FCC219 - bright, energetic)
        'tertiary': '#FCC219',
        'tertiary-dim': '#E0AC15',
        'tertiary-container': '#FFFBEA',
        'tertiary-fixed': '#FFFBEA',
        'tertiary-fixed-dim': '#FFF6D6',
        'on-tertiary': '#222222',
        'on-tertiary-container': '#222222',
        'on-tertiary-fixed': '#222222',
        'on-tertiary-fixed-variant': '#E0AC15',

        // Surface & Background - CLEAN WHITES with subtle warmth
        'surface': '#FFFFFF',               // Pure white base
        'surface-dim': '#F8F8F8',          // Very subtle gray
        'surface-bright': '#FFFFFF',
        'surface-container': '#FAFAFA',     // Nearly white
        'surface-container-low': '#FCFCFC',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-high': '#F5F5F5', // Light gray
        'surface-container-highest': '#EFEFEF',
        'surface-variant': '#F0F0F0',
        'surface-tint': '#FA8112',
        'on-surface': '#1A1A1A',           // Very dark gray (softer than pure black)
        'on-surface-variant': '#6B6B6B',   // Medium gray
        'inverse-surface': '#1A1A1A',
        'inverse-on-surface': '#FFFFFF',

        // Background Colors - CLEAN WHITE
        'background': '#FFFFFF',
        'on-background': '#1A1A1A',

        // Error Colors
        'error': '#E53935',
        'error-dim': '#C62828',
        'error-container': '#FFEBEE',
        'on-error': '#FFFFFF',
        'on-error-container': '#7F0000',

        // Outline Colors
        'outline': '#B0B0B0',           // Gray from logo
        'outline-variant': '#D9D9D9',   // Light gray from logo

        // Success (for order status, etc.) - Golden from logo
        'success': '#F5B03E',
        'success-container': '#FFF9E0',
        'on-success': '#222222',

        // Warning (for pending states) - Orange from logo
        'warning': '#FF8E00',
        'warning-container': '#FFE8D6',
        'on-warning': '#222222',
      },

      // Border Radius - "Friendly and Modern"
      borderRadius: {
        'DEFAULT': '1rem',      // 16px - Default rounded
        'md': '1.5rem',         // 24px - Medium rounded
        'lg': '2rem',           // 32px - Large rounded
        'xl': '3rem',           // 48px - Extra large (primary for cards)
        '2xl': '4rem',          // 64px - Premium rounded
        'full': '9999px',       // Fully rounded (pills)
      },

      // Typography - Poppins (Modern & Food-Friendly)
      fontFamily: {
        'headline': ['Poppins', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'label': ['Inter', 'system-ui', 'sans-serif'],
      },

      // Typography Scale - Mobile-first, responsive, accessible
      fontSize: {
        // Display - Hero sections, major CTAs (Mobile → Desktop)
        'display-lg': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],  // 40px mobile → 56px desktop
        'display-md': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '800' }],   // 32px mobile → 44px desktop
        'display-sm': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],  // 28px mobile → 36px desktop

        // Headline - Page titles, section headers (Mobile → Desktop)
        'headline-lg': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }], // 24px mobile → 32px desktop
        'headline-md': ['1.375rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],      // 22px mobile → 28px desktop
        'headline-sm': ['1.25rem', { lineHeight: '1.35', letterSpacing: '0', fontWeight: '600' }],      // 20px mobile → 24px desktop

        // Body - Content, descriptions (Mobile → Desktop)
        'body-lg': ['1rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],              // 16px both
        'body-md': ['0.9375rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],         // 15px mobile → 16px desktop
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],          // 14px both

        // Label - Buttons, tags, metadata (Mobile → Desktop)
        'label-lg': ['0.9375rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '600' }],   // 15px mobile → 16px desktop
        'label-md': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '600' }],    // 14px both
        'label-sm': ['0.8125rem', { lineHeight: '1.3', letterSpacing: '0.03em', fontWeight: '600' }],   // 13px both
      },

      // Spacing - Based on 1.4rem (22.4px) base unit
      spacing: {
        '1': '0.35rem',   // 5.6px
        '2': '0.7rem',    // 11.2px
        '3': '1rem',      // 16px - Small components
        '4': '1.4rem',    // 22.4px - Base unit, mobile gutters
        '5': '1.75rem',   // 28px
        '6': '2rem',      // 32px - Large containers
        '8': '2.75rem',   // 44px - Desktop admin gutters
        '10': '3.5rem',   // 56px - Major section spacing (breathing room)
        '12': '4.25rem',  // 68px
        '16': '5.6rem',   // 89.6px
        '20': '7rem',     // 112px
      },

      // Shadows - Minimal & Professional
      boxShadow: {
        'ambient': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'ambient-lg': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'primary': '0 4px 16px rgba(250, 129, 18, 0.2)',
        'card': '0 1px 6px rgba(0, 0, 0, 0.03)',
      },

      // Glassmorphism for floating elements
      backdropBlur: {
        'glass': '20px',
      },

      // Minimum touch targets for mobile
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}
