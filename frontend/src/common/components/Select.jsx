import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Custom Select Dropdown Component
 * Why? Native selects are hard to style consistently across browsers
 * Features: Search, keyboard navigation, custom styling, accessible
 */
const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  helperText,
  icon: Icon,
  searchable = false,
  disabled = false,
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Get selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          onChange(filteredOptions[focusedIndex].value);
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
      default:
        break;
    }
  };

  // Handle option selection
  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
    setFocusedIndex(-1);
  };

  return (
    <div className={`space-y-2 ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-label-lg lg:text-label-lg text-on-surface font-semibold">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}

      {/* Select Button */}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon size={20} className="text-on-surface-variant" />
          </div>
        )}

        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            w-full ${Icon ? 'pl-12' : 'pl-4'} pr-12 py-3.5 lg:py-4
            rounded-xl border-2 text-left transition-all
            ${error
              ? 'border-error bg-error/5 focus:ring-error/20'
              : isOpen
              ? 'border-primary bg-surface-container-lowest focus:ring-primary/20'
              : 'border-outline-variant bg-surface-container-lowest hover:border-primary/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            focus:outline-none focus:ring-4
            text-body-md lg:text-body-lg text-on-surface
          `}
        >
          <span className={selectedOption ? 'text-on-surface' : 'text-on-surface-variant'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </button>

        {/* Chevron Icon */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown
            size={20}
            className={`text-on-surface-variant transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-ambient-lg overflow-hidden"
            >
              {/* Search Input */}
              {searchable && (
                <div className="p-3 border-b border-outline-variant/30">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-10 pr-3 py-2 text-body-sm lg:text-body-md bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-8 text-center text-body-sm text-on-surface-variant">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`
                        w-full px-4 py-3 lg:py-3.5 text-left flex items-center justify-between
                        transition-colors text-body-md lg:text-body-lg
                        ${option.value === value
                          ? 'bg-primary/10 text-primary font-semibold'
                          : index === focusedIndex
                          ? 'bg-surface-container-high text-on-surface'
                          : 'text-on-surface hover:bg-surface-container'
                        }
                      `}
                      onMouseEnter={() => setFocusedIndex(index)}
                    >
                      <span className="flex-1">{option.label}</span>
                      {option.value === value && (
                        <Check size={18} className="text-primary flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-label-sm lg:text-label-md text-error font-medium">{error}</p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-label-sm lg:text-body-sm text-on-surface-variant">{helperText}</p>
      )}
    </div>
  );
};

Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.elementType,
  searchable: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default Select;
