import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { LOCL_STRG_KEY, TOAST_DURATION } from '../config/constants';

// Why use Context? Share cart state across all components without prop drilling
const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [vendorId, setVendorId] = useState(null);
  const [locationContext, setLocationContext] = useState({
    cafeteriaId: null,
    officeId: null,
    locationId: null,
  });

  // Load cart from localStorage on mount
  // Why? Persist cart across page refreshes
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(LOCL_STRG_KEY.CART);
      if (storedCart) {
        const { items, vendor, location } = JSON.parse(storedCart);
        setCartItems(items || []);
        setVendorId(vendor || null);
        setLocationContext(location || { cafeteriaId: null, officeId: null, locationId: null });
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      localStorage.removeItem(LOCL_STRG_KEY.CART);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  // Why? Automatic persistence without manual save calls
  useEffect(() => {
    if (cartItems.length > 0 || vendorId) {
      localStorage.setItem(
        LOCL_STRG_KEY.CART,
        JSON.stringify({ items: cartItems, vendor: vendorId, location: locationContext })
      );
    } else {
      localStorage.removeItem(LOCL_STRG_KEY.CART);
    }
  }, [cartItems, vendorId, locationContext]);

  // Set location context (cafeteriaId, officeId) for orders
  const setLocation = useCallback((cafeteriaId, officeId, locationId) => {
    setLocationContext({ cafeteriaId, officeId, locationId });
  }, []);

  // Add item to cart
  // Why useCallback? Stable function reference for optimization
  const addToCart = useCallback((item, quantity = 1) => {
    // Validate vendor - can only order from one vendor at a time
    // Why? Business rule: single vendor per order
    if (vendorId && vendorId !== item.vendorId) {
      toast.error(
        'You can only order from one vendor at a time. Clear cart to order from a different vendor.',
        { duration: TOAST_DURATION.ERROR }
      );
      return false;
    }

    // Validate location context is set
    if (!locationContext.cafeteriaId || !locationContext.officeId) {
      toast.error(
        'Please select a location before adding items to cart.',
        { duration: TOAST_DURATION.ERROR }
      );
      return false;
    }

    setCartItems(prev => {
      // Check if item already exists
      const existingIndex = prev.findIndex(cartItem => cartItem.id === item.id);

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        toast.success('Quantity updated', { duration: TOAST_DURATION.SUCCESS });
        return updated;
      } else {
        // Add new item
        toast.success('Added to cart', { duration: TOAST_DURATION.SUCCESS });
        return [...prev, { ...item, quantity }];
      }
    });

    // Set vendor ID if not set
    if (!vendorId) {
      setVendorId(item.vendorId);
    }

    return true;
  }, [vendorId, locationContext]);

  // Remove item from cart
  const removeFromCart = useCallback((itemId) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== itemId);

      // Clear vendor ID if cart is empty
      if (updated.length === 0) {
        setVendorId(null);
      }

      toast.success('Removed from cart', { duration: TOAST_DURATION.SUCCESS });
      return updated;
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prev => {
      return prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  }, [removeFromCart]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    setVendorId(null);
    setLocationContext({ cafeteriaId: null, officeId: null, locationId: null });
    localStorage.removeItem(LOCL_STRG_KEY.CART);
    toast.success('Cart cleared', { duration: TOAST_DURATION.SUCCESS });
  }, []);

  // Get item quantity in cart
  const getItemQuantity = useCallback((itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    return item?.quantity || 0;
  }, [cartItems]);

  // Check if item is in cart
  const isInCart = useCallback((itemId) => {
    return cartItems.some(item => item.id === itemId);
  }, [cartItems]);

  // Calculate cart totals
  // Why useMemo? Expensive calculation, only recalculate when cart changes
  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Calculate tax (e.g., 5% GST)
    const tax = subtotal * 0.05;

    // Calculate total
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cartItems]);

  // Memoize context value
  // Why? Prevents unnecessary re-renders of consuming components
  const value = useMemo(
    () => ({
      // State
      cartItems,
      vendorId,
      locationContext,
      cartTotals,
      isEmpty: cartItems.length === 0,

      // Actions
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setLocation,

      // Helpers
      getItemQuantity,
      isInCart,
    }),
    [
      cartItems,
      vendorId,
      locationContext,
      cartTotals,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setLocation,
      getItemQuantity,
      isInCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
};

export default CartContext;
