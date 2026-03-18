import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';

/**
 * Input Component
 *
 * Comprehensive input with icon support, validation states, password toggle, and accessibility
 */
const Input = forwardRef(({
  type = 'text',
  label = '',
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  onFocus,
  error = '',
  helperText = '',
  disabled = false,
  required = false,
  fullWidth = true,
  leftIcon = null,
  rightIcon = null,
  className = '',
  inputClassName = '',
  size = 'md',
  name,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Size variants
  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg',
  };

  // Container classes
  const containerClasses = `flex flex-col ${fullWidth ? 'w-full' : ''} ${className}`;

  // Input wrapper classes
  const wrapperClasses = `
    relative flex items-center
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
  `;

  // Input classes
  const inputClasses = `
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${leftIcon ? 'pl-11' : 'pl-4'}
    ${rightIcon || type === 'password' ? 'pr-11' : 'pr-4'}
    ${error ? 'border-error focus:ring-error' : 'border-gray-200 dark:border-gray-700 focus:ring-primary focus:border-primary'}
    ${isFocused ? 'ring-2 ring-opacity-50' : ''}
    rounded-xl
    border-2
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    placeholder:text-gray-400
    transition-all
    focus:outline-none
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${inputClassName}
  `;

  // Icon container classes
  const iconContainerClasses = 'absolute flex items-center justify-center w-10 h-full text-gray-400';

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className={wrapperClasses}>
        {/* Left icon */}
        {leftIcon && (
          <div className={`${iconContainerClasses} left-0`}>
            {leftIcon}
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        />

        {/* Right icon or password toggle */}
        {type === 'password' ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`${iconContainerClasses} right-0 cursor-pointer hover:text-gray-600 transition-colors`}
            tabIndex={-1}
          >
            <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
          </button>
        ) : rightIcon ? (
          <div className={`${iconContainerClasses} right-0`}>
            {rightIcon}
          </div>
        ) : null}
      </div>

      {/* Error message */}
      {error && (
        <p id={`${props.id}-error`} className="mt-1.5 text-sm text-error flex items-center gap-1">
          <Icon name="error" size={16} />
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p id={`${props.id}-helper`} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'tel', 'number', 'url', 'search']),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  id: PropTypes.string,
  name: PropTypes.string,
};

export default Input;