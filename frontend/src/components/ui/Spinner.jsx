import PropTypes from 'prop-types';

const Spinner = ({ size = 'md', variant = 'circle', className = '' }) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-1 ${className}`}>
        <div className={`${sizeClasses[size]} bg-primary rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
        <div className={`${sizeClasses[size]} bg-primary rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
        <div className={`${sizeClasses[size]} bg-primary rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} bg-primary rounded-full animate-pulse ${className}`} />
    );
  }

  // Default circle spinner
  return (
    <div
      className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary rounded-full animate-spin ${className}`}
    />
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['circle', 'dots', 'pulse']),
  className: PropTypes.string,
};

export default Spinner;
