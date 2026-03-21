import { useState } from 'react';
import PropTypes from 'prop-types';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../../common/components/Button';
import Badge from '../../../common/components/Badge';
import { useCart } from '../../../contexts';
import { formatCurrency } from '../../../common/utils';

// Menu Item Card - displays food item with add to cart functionality
// Why? Core component for browsing and ordering
const MenuItemCard = ({ item, variant = 'default' }) => {
  const { addToCart, getItemQuantity, updateQuantity, isInCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const quantity = getItemQuantity(item.id);
  const inCart = isInCart(item.id);

  // Handle add to cart
  const handleAdd = () => {
    setIsAdding(true);
    const success = addToCart(item, 1);

    // Animation delay
    setTimeout(() => setIsAdding(false), 300);

    if (!success) {
      // Cart context already shows error toast if vendor mismatch
      return;
    }
  };

  // Handle quantity increase
  const handleIncrease = () => {
    updateQuantity(item.id, quantity + 1);
  };

  // Handle quantity decrease
  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(item.id, quantity - 1);
    } else {
      updateQuantity(item.id, 0); // Removes from cart
    }
  };

  // Grid variant (default) - for grid layouts
  if (variant === 'grid') {
    return (
      <motion.div
        layout
        className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-card hover:shadow-ambient transition-shadow"
      >
        {/* Image */}
        <div className="relative aspect-food bg-surface-container">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart size={40} className="text-on-surface-variant opacity-20" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {item.isVegetarian && (
              <Badge variant="success" size="sm">Veg</Badge>
            )}
            {item.isNew && (
              <Badge variant="primary" size="sm">New</Badge>
            )}
            {!item.isAvailable && (
              <Badge variant="error" size="sm">Out of Stock</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title and Price */}
          <div>
            <h3 className="font-headline text-body-lg text-on-surface line-clamp-1">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-label-sm text-on-surface-variant line-clamp-2 mt-1">
                {item.description}
              </p>
            )}
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div className="font-headline text-headline-sm text-primary">
              {formatCurrency(item.price)}
            </div>

            {/* Add to cart or quantity controls */}
            {!inCart ? (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={16} />}
                onClick={handleAdd}
                disabled={!item.isAvailable || isAdding}
              >
                Add
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDecrease}
                  className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors"
                >
                  <Minus size={16} className="text-on-surface" />
                </button>
                <span className="font-headline text-body-lg text-on-surface min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  className="w-8 h-8 rounded-lg bg-primary hover:bg-primary-dim flex items-center justify-center transition-colors"
                >
                  <Plus size={16} className="text-on-primary" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // List variant - for list layouts (default)
  return (
    <motion.div
      layout
      className="bg-surface-container-lowest rounded-xl p-4 shadow-card hover:shadow-ambient transition-shadow flex gap-4"
    >
      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface-container">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart size={24} className="text-on-surface-variant opacity-20" />
          </div>
        )}

        {/* Availability overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
            <span className="text-label-sm text-error font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-headline text-body-lg text-on-surface line-clamp-1">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-label-sm text-on-surface-variant line-clamp-1 mt-0.5">
                {item.description}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex gap-1 flex-shrink-0">
            {item.isVegetarian && (
              <Badge variant="success" size="sm">Veg</Badge>
            )}
            {item.isNew && (
              <Badge variant="primary" size="sm">New</Badge>
            )}
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-auto">
          <div className="font-headline text-headline-sm text-primary">
            {formatCurrency(item.price)}
          </div>

          {/* Add to cart or quantity controls */}
          {!inCart ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={handleAdd}
              disabled={!item.isAvailable || isAdding}
            >
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrease}
                className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors"
              >
                <Minus size={14} className="text-on-surface" />
              </button>
              <span className="font-headline text-body-md text-on-surface min-w-[16px] text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-7 h-7 rounded-lg bg-primary hover:bg-primary-dim flex items-center justify-center transition-colors"
              >
                <Plus size={14} className="text-on-primary" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

MenuItemCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    imageUrl: PropTypes.string,
    isAvailable: PropTypes.bool,
    isVegetarian: PropTypes.bool,
    isNew: PropTypes.bool,
    vendorId: PropTypes.number.isRequired,
  }).isRequired,
  variant: PropTypes.oneOf(['default', 'grid']),
};

export default MenuItemCard;
