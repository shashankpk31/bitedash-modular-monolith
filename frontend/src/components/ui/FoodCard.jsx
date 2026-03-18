import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from './Icon';
import Badge from './Badge';
import { foodPlaceholder } from '../../utils/placeholders';

/**
 * FoodCard component for menu items
 * Based on stitch employee_home_menu design
 */
const FoodCard = ({
  item,
  onAddToCart,
  layout = 'horizontal', // 'horizontal' or 'vertical'
  className = '',
}) => {
  const {
    id,
    name,
    description,
    price,
    imageUrl,
    isVeg,
    isVegan,
    prepTime,
    category,
    isAvailable = true,
  } = item;

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (onAddToCart && isAvailable) {
      onAddToCart(item);
    }
  };

  if (layout === 'vertical') {
    return (
      <motion.div
        className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm hover:shadow-md transition-shadow ${className}`}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={imageUrl || foodPlaceholder}
            alt={name}
            className="w-full h-full object-cover"
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Unavailable</span>
            </div>
          )}
          {/* Dietary badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {isVeg && (
              <Badge variant="veg" size="xs">
                VEG
              </Badge>
            )}
            {isVegan && (
              <Badge variant="success" size="xs">
                VEGAN
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-1">
              {name}
            </h4>
            <span className="text-primary font-bold text-base ml-2">${price}</span>
          </div>

          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
              {description}
            </p>
          )}

          <div className="flex justify-between items-center">
            {prepTime && (
              <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                <Icon name="schedule" size={12} />
                <span>{prepTime} min</span>
              </div>
            )}
            <button
              onClick={handleAddClick}
              disabled={!isAvailable}
              className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Icon name="add" size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Horizontal layout (default)
  return (
    <motion.div
      className={`bg-white dark:bg-slate-800 p-3 rounded-2xl flex gap-4 ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm hover:shadow-md transition-shadow ${className}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Image */}
      <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
        <img
          src={imageUrl || foodPlaceholder}
          alt={name}
          className="w-full h-full object-cover"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 py-1">
        <div>
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm">
                {name}
              </h4>
              {isVeg && (
                <div className="w-3 h-3 border-2 border-green-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                </div>
              )}
              {!isVeg && (
                <div className="w-3 h-3 border-2 border-red-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                </div>
              )}
            </div>
            <span className="text-primary font-bold text-sm whitespace-nowrap">
              ${price}
            </span>
          </div>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mt-2">
          {prepTime && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
              <Icon name="schedule" size={12} />
              <span>{prepTime} min</span>
            </div>
          )}
          <button
            onClick={handleAddClick}
            disabled={!isAvailable}
            className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ml-auto"
          >
            <Icon name="add" size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

FoodCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    imageUrl: PropTypes.string,
    isVeg: PropTypes.bool,
    isVegan: PropTypes.bool,
    prepTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category: PropTypes.string,
    isAvailable: PropTypes.bool,
  }).isRequired,
  onAddToCart: PropTypes.func,
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  className: PropTypes.string,
};

export default FoodCard;
