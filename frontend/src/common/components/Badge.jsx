import PropTypes from 'prop-types';
import { ORDER_STATUS } from '../../config/constants';

// Badge component for status indicators, labels, counts
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  pill = false,
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-label font-semibold';

  // Variant styles - using secondary-container for warm tones
  const variantStyles = {
    default: 'bg-surface-container text-on-surface',
    primary: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-secondary-container text-on-secondary-container',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-error-container text-on-error-container',
    info: 'bg-blue-100 text-blue-800',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-label-sm',
    md: 'px-3 py-1 text-label-md',
    lg: 'px-4 py-1.5 text-label-lg',
  };

  // Shape styles
  const shapeStyles = pill ? 'rounded-full' : 'rounded';

  // Combine styles
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${shapeStyles} ${className}`;

  return (
    <span className={combinedStyles} {...props}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  pill: PropTypes.bool,
  className: PropTypes.string,
};

// StatusBadge component for order status indicators
// Why? Different order statuses need different badge styles
export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  // Map order status to badge variant
  const getVariant = (orderStatus) => {
    switch (orderStatus) {
      case ORDER_STATUS.PENDING:
        return 'warning';
      case ORDER_STATUS.CONFIRMED:
        return 'info';
      case ORDER_STATUS.PREPARING:
        return 'primary';
      case ORDER_STATUS.READY:
        return 'success';
      case ORDER_STATUS.PICKED_UP:
        return 'success';
      case ORDER_STATUS.COMPLETED:
        return 'success';
      case ORDER_STATUS.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  // Format status text for display
  const formatStatus = (orderStatus) => {
    return orderStatus
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Badge variant={getVariant(status)} size={size} className={className}>
      {formatStatus(status)}
    </Badge>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(Object.values(ORDER_STATUS)).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Badge;
