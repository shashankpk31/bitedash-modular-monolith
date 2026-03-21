import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';

// Input component following design system with bottom-only "ghost border"
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  helperText,
  icon = null,
  iconPosition = 'left',
  disabled = false,
  required = false,
  fullWidth = true,
  className = '',
  containerClassName = '',
  onChange,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  // Determine actual input type (handle password visibility toggle)
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Base container styles
  const containerStyles = fullWidth ? 'w-full' : '';

  // Base input styles
  const baseInputStyles = 'w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant focus:outline-none transition-colors';

  // Padding based on icon presence
  const paddingStyles = icon
    ? iconPosition === 'left'
      ? 'pl-10 pr-4'
      : 'pl-4 pr-10'
    : 'px-4';

  // Error state styles
  const errorStyles = error
    ? 'border-error text-error'
    : 'border-outline-variant hover:border-outline focus:border-primary';

  // Disabled styles
  const disabledStyles = disabled
    ? 'opacity-60 cursor-not-allowed'
    : '';

  // Combined input styles
  const inputStyles = `${baseInputStyles} ${paddingStyles} ${errorStyles} ${disabledStyles} h-12 rounded-t-md border-b-2 ${className}`;

  // Icon styles
  const iconStyles = 'absolute top-1/2 -translate-y-1/2 text-on-surface-variant';
  const iconLeftStyles = 'left-3';
  const iconRightStyles = 'right-3';

  return (
    <div className={`${containerStyles} ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className="block text-label-md text-on-surface mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          <div className={`${iconStyles} ${iconLeftStyles}`}>
            {icon}
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputStyles}
          onChange={onChange}
          {...props}
        />

        {/* Right icon or password toggle */}
        {type === 'password' ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`${iconStyles} ${iconRightStyles} cursor-pointer hover:text-on-surface transition-colors`}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : (
          icon && iconPosition === 'right' && (
            <div className={`${iconStyles} ${iconRightStyles}`}>
              {icon}
            </div>
          )
        )}
      </div>

      {/* Helper text or error message */}
      {(helperText || error) && (
        <p className={`mt-1 text-label-sm ${error ? 'text-error' : 'text-on-surface-variant'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'search']),
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  onChange: PropTypes.func,
};

export default Input;
