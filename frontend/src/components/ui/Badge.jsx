import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge component for status indicators, labels, and tags
 * Used in stitch designs for dietary indicators, promos, status, etc.
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded';

  const variantClasses = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    primary: 'bg-primary text-white',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    promo: 'bg-primary text-white',
    new: 'bg-amber-500 text-white',
    veg: 'bg-green-100 text-green-700 border border-green-300',
    nonVeg: 'bg-red-100 text-red-700 border border-red-300',
  };

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const badgeClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  return (
    <span className={badgeClasses} {...props}>
      {icon && <span className="text-current">{icon}</span>}
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'warning',
    'danger',
    'info',
    'promo',
    'new',
    'veg',
    'nonVeg',
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string,
  icon: PropTypes.node,
};

export default Badge;
