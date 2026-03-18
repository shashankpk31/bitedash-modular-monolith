import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../../ui/Icon';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import { foodPlaceholder } from '../../../utils/placeholders';

/**
 * FoodCard Component
 *
 * Displays food item with image, details, and add to cart button
 * Supports horizontal (default) and vertical layouts
 */
const FoodCard = ({ item, onAddToCart, layout = 'horizontal' }) => {
  const {
    name,
    description,
    price,
    imageUrl,
    isVeg,
    isVegan,
    prepTime,
    isAvailable = true,
    rating,
    category,
  } = item;

  if (layout === 'vertical') {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
      >
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          <img
            src={imageUrl || foodPlaceholder}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = foodPlaceholder; }}
          />
          {/* Veg/Non-veg indicator */}
          <div className="absolute top-2 left-2">
            {isVeg && (
              <div className="bg-white rounded px-1.5 py-0.5 flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-green-600 rounded flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                </div>
              </div>
            )}
          </div>
          {/* Category badge */}
          {category && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" size="xs">
                {category}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
            {name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {description}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
            {prepTime && (
              <div className="flex items-center gap-1">
                <Icon name="schedule" size={14} />
                <span>{prepTime} min</span>
              </div>
            )}
            {rating && (
              <div className="flex items-center gap-1">
                <Icon name="star" size={14} className="text-warning" fill={1} />
                <span>{rating}</span>
              </div>
            )}
          </div>

          {/* Price and action */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              ${price.toFixed(2)}
            </span>
            <Button
              size="sm"
              onClick={onAddToCart}
              disabled={!isAvailable}
              icon={<Icon name="add" size={18} />}
            >
              Add
            </Button>
          </div>

          {!isAvailable && (
            <p className="text-xs text-error mt-2">Out of stock</p>
          )}
        </div>
      </motion.div>
    );
  }

  // Horizontal layout (default)
  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow flex"
    >
      {/* Image */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-200">
        <img
          src={imageUrl || foodPlaceholder}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = foodPlaceholder; }}
        />
        {/* Veg/Non-veg indicator */}
        <div className="absolute top-2 left-2">
          {isVeg ? (
            <div className="bg-white rounded px-1 py-0.5 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-green-600 rounded flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded px-1 py-0.5 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-red-600 rounded flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
            {name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
            {description}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
            {prepTime && (
              <div className="flex items-center gap-1">
                <Icon name="schedule" size={14} />
                <span>{prepTime} min</span>
              </div>
            )}
            {rating && (
              <div className="flex items-center gap-1">
                <Icon name="star" size={14} className="text-warning" fill={1} />
                <span>{rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price and action */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ${price.toFixed(2)}
          </span>
          <Button
            size="sm"
            onClick={onAddToCart}
            disabled={!isAvailable}
            icon={<Icon name="add" size={16} />}
            iconPosition="right"
          >
            Add
          </Button>
        </div>

        {!isAvailable && (
          <p className="text-xs text-error mt-1">Out of stock</p>
        )}
      </div>
    </motion.div>
  );
};

FoodCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    imageUrl: PropTypes.string.isRequired,
    isVeg: PropTypes.bool,
    isVegan: PropTypes.bool,
    prepTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isAvailable: PropTypes.bool,
    rating: PropTypes.number,
    category: PropTypes.string,
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
};

export default FoodCard;
