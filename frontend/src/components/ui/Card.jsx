import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Card Component
 *
 * Flexible container component with variants, padding options, and hover effects
 */
const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  onClick,
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = 'rounded-xl bg-white dark:bg-gray-800 transition-all';

  // Variant styles
  const variantClasses = {
    default: 'border border-gray-200 dark:border-gray-700',
    elevated: 'shadow-md',
    flat: 'shadow-none',
    outlined: 'border-2 border-gray-300 dark:border-gray-600',
  };

  // Padding variants
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Hover effect
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';

  // Clickable card
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${clickableClasses} ${className}`;

  const cardContent = <div className={combinedClasses} {...props}>{children}</div>;

  // Use motion.div if hoverable
  if (hover || onClick) {
    return (
      <motion.div
        className={combinedClasses}
        onClick={onClick}
        whileHover={hover ? { y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' } : {}}
        whileTap={onClick ? { scale: 0.98 } : {}}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return cardContent;
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'flat', 'outlined']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  hover: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export { Card };
export default Card;