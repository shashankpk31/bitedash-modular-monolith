import PropTypes from 'prop-types';

// Spinner/Loading component
const Spinner = ({
  size = 'md',
  variant = 'primary',
  className = '',
  ...props
}) => {
  // Size mapping
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Color variants
  const colorStyles = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
    current: 'text-current',
  };

  return (
    <svg
      className={`animate-spin ${sizeStyles[size]} ${colorStyles[variant]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
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
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'white', 'current']),
  className: PropTypes.string,
};

// Full page loading component
export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-surface">
    <Spinner size="xl" variant="primary" />
    {message && (
      <p className="mt-4 text-body-lg text-on-surface-variant font-medium">
        {message}
      </p>
    )}
  </div>
);

PageLoader.propTypes = {
  message: PropTypes.string,
};

// Inline content loader
export const ContentLoader = ({ message, className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <Spinner size="lg" variant="primary" />
    {message && (
      <p className="mt-3 text-body-md text-on-surface-variant">
        {message}
      </p>
    )}
  </div>
);

ContentLoader.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
};

export default Spinner;
