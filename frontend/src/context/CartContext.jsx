import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

/**
 * CartContext
 *
 * Global cart state management with localStorage persistence
 * CRITICAL: This unblocks all employee features
 */

const CartContext = createContext(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bitedash_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('bitedash_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load coupon from localStorage:', error);
      return null;
    }
  });

  const [vendorId, setVendorId] = useState(() => {
    try {
      const saved = localStorage.getItem('bitedash_vendor');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load vendor from localStorage:', error);
      return null;
    }
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('bitedash_cart', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  // Persist coupon to localStorage
  useEffect(() => {
    try {
      if (coupon) {
        localStorage.setItem('bitedash_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('bitedash_coupon');
      }
    } catch (error) {
      console.error('Failed to save coupon to localStorage:', error);
    }
  }, [coupon]);

  // Persist vendor to localStorage
  useEffect(() => {
    try {
      if (vendorId) {
        localStorage.setItem('bitedash_vendor', JSON.stringify(vendorId));
      } else {
        localStorage.removeItem('bitedash_vendor');
      }
    } catch (error) {
      console.error('Failed to save vendor to localStorage:', error);
    }
  }, [vendorId]);

  /**
   * Add item to cart
   * If item exists, increase quantity
   * If new item is from different vendor, prompt to clear cart
   */
  const addItem = useCallback((item, quantity = 1) => {
    // Check if item is from different vendor
    if (vendorId && item.vendorId && item.vendorId !== vendorId) {
      const confirmClear = window.confirm(
        'Your cart contains items from a different vendor. Do you want to clear your cart and add this item?'
      );
      if (!confirmClear) {
        return false;
      }
      clearCart();
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);

      if (existing) {
        // Update quantity
        return prev.map((i) =>
          i.menuItemId === item.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      // Add new item
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity,
          imageUrl: item.imageUrl,
          vendorId: item.vendorId,
          vendorName: item.vendorName,
          isVeg: item.isVeg,
          addons: [],
          specialInstructions: '',
        },
      ];
    });

    // Set vendor ID if this is first item
    if (!vendorId && item.vendorId) {
      setVendorId(item.vendorId);
    }

    return true;
  }, [vendorId]);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback((menuItemId) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.menuItemId !== menuItemId);

      // Clear vendor if cart is empty
      if (filtered.length === 0) {
        setVendorId(null);
      }

      return filtered;
    });
  }, []);

  /**
   * Update item quantity
   * If quantity is 0 or less, remove item
   */
  const updateQuantity = useCallback((menuItemId, quantity) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      )
    );
  }, [removeItem]);

  /**
   * Update item special instructions
   */
  const updateItemInstructions = useCallback((menuItemId, instructions) => {
    setItems((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId ? { ...i, specialInstructions: instructions } : i
      )
    );
  }, []);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    setVendorId(null);
  }, []);

  /**
   * Apply coupon code
   */
  const applyCoupon = useCallback((couponData) => {
    setCoupon(couponData);
    toast.success(`Coupon applied! ${couponData.discount}% off`);
  }, []);

  /**
   * Remove coupon
   */
  const removeCoupon = useCallback(() => {
    setCoupon(null);
  }, []);

  // Computed values
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate discount if coupon applied
  const discount = coupon ? (subtotal * coupon.discount) / 100 : 0;

  // Tax (8% - should come from backend config ideally)
  const tax = subtotal * 0.08;

  // Total before wallet deduction
  const total = subtotal - discount + tax;

  // Check if cart is empty
  const isEmpty = items.length === 0;

  const value = {
    // State
    items,
    coupon,
    vendorId,
    isEmpty,

    // Computed values
    itemCount,
    subtotal,
    discount,
    tax,
    total,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    updateItemInstructions,
    clearCart,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CartContext;
