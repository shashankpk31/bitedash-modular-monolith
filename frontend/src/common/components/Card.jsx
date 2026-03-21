import PropTypes from 'prop-types';

// Card component following "The Appetizing Editorial" design system
// Key principle: "No-Line Rule" - use tonal layering instead of borders
const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  className = '',
  onClick,
  ...props
}) => {
  // Base styles - tonal layering with ambient shadow
  const baseStyles = 'transition-all duration-200';

  // Variant styles - different surface levels create depth
  const variantStyles = {
    // Default: floating level with ambient shadow
    default: 'bg-surface-container-lowest shadow-card',

    // Elevated: higher in visual hierarchy
    elevated: 'bg-surface-container-lowest shadow-ambient',

    // Subtle: lower in hierarchy, less prominent
    subtle: 'bg-surface-container-low',

    // Flat: no shadow, minimal
    flat: 'bg-surface-container',

    // Outline: ghost border for accessibility if needed
    outline: 'bg-surface-container-lowest border border-outline-variant/15',
  };

  // Padding styles - consistent spacing
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Hover effect - only if enabled
  const hoverStyles = hover
    ? 'hover:shadow-ambient-lg hover:-translate-y-0.5'
    : '';

  // Clickable cursor
  const cursorStyles = clickable || onClick ? 'cursor-pointer' : '';

  // Combine all styles
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${cursorStyles} rounded-xl ${className}`;

  return (
    <div className={combinedStyles} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'subtle', 'flat', 'outline']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  hover: PropTypes.bool,
  clickable: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

// Card Header subcomponent
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Card Title subcomponent
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`font-headline text-headline-md text-on-surface ${className}`} {...props}>
    {children}
  </h3>
);

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Card Description subcomponent
export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-body-md text-on-surface-variant ${className}`} {...props}>
    {children}
  </p>
);

CardDescription.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Card Content subcomponent
export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Card Footer subcomponent
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 flex items-center gap-2 ${className}`} {...props}>
    {children}
  </div>
);

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
