/**
 * BiteDash Theme Configuration
 * JavaScript access to design tokens
 */

export const colors = {
  primary: {
    DEFAULT: '#FF5200',
    light: '#FF7433',
    dark: '#CC4100',
    alpha10: 'rgba(255, 82, 0, 0.1)',
    alpha20: 'rgba(255, 82, 0, 0.2)',
    alpha30: 'rgba(255, 82, 0, 0.3)',
  },
  success: {
    DEFAULT: '#22C55E',
    light: '#4ADE80',
    dark: '#16A34A',
    alpha10: 'rgba(34, 197, 94, 0.1)',
  },
  warning: {
    DEFAULT: '#F59E0B',
    light: '#FBB042',
    dark: '#D97706',
    alpha10: 'rgba(245, 158, 11, 0.1)',
  },
  error: {
    DEFAULT: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    alpha10: 'rgba(239, 68, 68, 0.1)',
  },
  info: {
    DEFAULT: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    alpha10: 'rgba(59, 130, 246, 0.1)',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
};

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
};

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

export const borderRadius = {
  none: '0',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
};

export const boxShadow = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  primary: '0 10px 20px -5px rgba(255, 82, 0, 0.2)',
};

export const transition = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Utility function to get CSS variable value
export const getCSSVar = (varName) => {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
};

// Utility function to set CSS variable
export const setCSSVar = (varName, value) => {
  document.documentElement.style.setProperty(varName, value);
};

export default {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  boxShadow,
  transition,
  breakpoints,
  zIndex,
  getCSSVar,
  setCSSVar,
};
