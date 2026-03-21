import PropTypes from 'prop-types';
import { forwardRef } from 'react';

// Button component following "The Appetizing Editorial" design system
// Why forwardRef? Allows parent components to attach refs for DOM access
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  // Base styles - consistent across all variants
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-label font-semibold transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed tap-target touch-manipulation';

  // Variant styles - following design system color tokens
  const variantStyles = {
    // Primary with signature gradient
    primary: 'gradient-primary text-on-primary shadow-primary hover:shadow-lg active:scale-95',

    // Secondary with surface container background
    secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest active:scale-95',

    // Tertiary ghost style
    tertiary: 'text-primary bg-transparent hover:bg-primary/10 active:bg-primary/20',

    // Outlined
    outline: 'border-2 border-outline text-on-surface hover:bg-surface-container-low active:bg-surface-container',

    // Danger/Error
    danger: 'bg-error text-on-error hover:bg-error-dim active:scale-95',

    // Success
    success: 'bg-green-600 text-white hover:bg-green-700 active:scale-95',

    // Ghost (minimal)
    ghost: 'text-on-surface hover:bg-surface-container-low active:bg-surface-container',
  };

  // Size styles - proper touch targets and spacing
  const sizeStyles = {
    sm: 'h-9 px-4 text-label-sm rounded-lg',
    md: 'h-11 px-6 text-label-md rounded-lg',
    lg: 'h-14 px-8 text-label-lg rounded-xl',
    xl: 'h-16 px-10 text-headline-sm rounded-xl',
  };

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  // Combine all styles
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

  // Loading spinner component
  const Spinner = () => (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      ref={ref}
      type={type}
      className={combinedStyles}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <Spinner />}
      {!loading && icon && iconPosition === 'left' && icon}
      {!loading && children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'tertiary', 'outline', 'danger', 'success', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
