import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Icon from '../../../../components/ui/Icon';
import walletService from '../../../../services/walletService';
import orderService from '../../../../services/orderService';

/**
 * Employee Cart Screen
 * Based on stitch: employee_cart
 *
 * POST-COMPLETION TODO:
 * 1. Integrate with CartContext for global cart state
 * 2. Add real order creation API call
 * 3. Handle payment/wallet deduction
 * 4. Navigate to order confirmation after successful order
 */

const EmployeeCart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state (TODO: Move to CartContext)
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [couponCode, setCouponCode] = useState('');
  const [instructions, setInstructions] = useState('');

  // Fetch wallet balance
  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletService.getMyWallet,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData) => orderService.createOrder(orderData),
    onSuccess: (order) => {
      toast.success('Order placed successfully!');
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['wallet']);
      // TODO: Navigate to order confirmation with QR code
      navigate(`/employee/orders/${order.id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to place order');
    },
  });

  // Calculate prices
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const walletDeduction = Math.min(wallet?.balance || 0, 5.00); // Max $5 wallet usage
  const total = subtotal + tax - walletDeduction;

  const handleQuantityChange = (itemId, change) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        if (newQuantity === 0) {
          // Remove item
          return null;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    // TODO: Implement coupon validation API
    toast.success('Coupon applied successfully!');
  };

  const handleConfirmOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (total > wallet?.balance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    const orderData = {
      items: cartItems.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        addons: item.addons || [],
      })),
      specialInstructions: instructions,
      couponCode: couponCode || null,
      // TODO: Add vendorId, cafeteriaId from context
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-white dark:bg-background-dark shadow-xl overflow-x-hidden">
      {/* Top Navigation */}
      <div className="flex items-center bg-white dark:bg-background-dark p-4 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <Icon name="arrow_back" />
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          Cart
        </h2>
      </div>

      {/* Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Empty Cart State */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 px-4">
            <Icon name="shopping_cart" size={64} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
              Add some delicious items to your cart to get started
            </p>
            <button
              onClick={() => navigate('/employee/menu')}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* Items Section */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">
                  Your Order
                </h3>
                <span className="text-primary text-sm font-medium">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"
                  >
                    {/* Item Image */}
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 shrink-0"
                      style={{ backgroundImage: `url(${item.imageUrl})` }}
                    />

                    {/* Item Details */}
                    <div className="flex flex-col flex-1 justify-center">
                      <p className="text-slate-900 dark:text-slate-100 text-base font-semibold leading-tight line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-normal mb-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 active:scale-95"
                        >
                          <Icon name="remove" size={16} />
                        </button>
                        <span className="text-base font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white active:scale-95"
                        >
                          <Icon name="add" size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="px-4 py-4">
              <label className="flex flex-col w-full">
                <p className="text-slate-900 dark:text-slate-100 text-base font-semibold pb-2">
                  Apply Coupon
                </p>
                <div className="flex w-full items-stretch">
                  <input
                    className="flex w-full min-w-0 flex-1 rounded-l-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 placeholder:text-slate-400 p-4 text-sm font-normal"
                    placeholder="Enter promo code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-primary text-white px-4 rounded-r-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </label>
            </div>

            {/* Instructions Section */}
            <div className="px-4 py-4">
              <p className="text-slate-900 dark:text-slate-100 text-base font-semibold pb-2">
                Delivery Instructions
              </p>
              <textarea
                className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 text-sm focus:ring-primary/50 focus:border-primary min-h-[100px]"
                placeholder="e.g. Leave at Desk 4B, use side entrance..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            {/* Price Breakdown */}
            <div className="px-4 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Tax (8%)</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  ${tax.toFixed(2)}
                </span>
              </div>
              {walletDeduction > 0 && (
                <div className="flex justify-between items-center p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icon name="account_balance_wallet" className="text-primary" />
                    <span className="text-primary font-semibold">Wallet Deduction</span>
                  </div>
                  <span className="text-primary font-bold">-${walletDeduction.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-900 dark:text-slate-100 text-lg font-bold">
                  Total
                </span>
                <span className="text-slate-900 dark:text-slate-100 text-xl font-extrabold">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky Footer Action */}
      {cartItems.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleConfirmOrder}
            disabled={createOrderMutation.isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createOrderMutation.isLoading ? 'Processing...' : 'Confirm Order'}
            <Icon name="arrow_forward" />
          </button>
        </div>
      )}
    </div>
  );
};

// Mock cart items (TODO: Replace with CartContext)
const mockCartItems = [
  {
    id: 1,
    name: 'Quinoa Power Bowl',
    price: 14.50,
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    addons: [],
  },
  {
    id: 2,
    name: 'Cold Brew Oat Latte',
    price: 6.00,
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    addons: [],
  },
];

export default EmployeeCart;
