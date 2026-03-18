import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import walletService from '../../../services/walletService';
import orderService from '../../../services/orderService';

const CartPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, total, subtotal, tax, itemCount } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [instructions, setInstructions] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletService.getMyWallet,
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => orderService.createOrder(orderData),
    onSuccess: (order) => {
      clearCart();
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['wallet']);
      navigate(`/employee/orders/${order.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    // TODO: Validate coupon via API when endpoint available
    setAppliedCoupon({ code: couponCode, discount: 10 });
    toast.success('Coupon applied! 10% off');
  };

  const walletDeduction = Math.min(wallet?.balance || 0, total);
  const finalTotal = total - walletDeduction;

  const handleConfirmOrder = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (finalTotal > 0 && finalTotal > (wallet?.balance || 0)) {
      toast.error('Insufficient wallet balance');
      return;
    }

    const orderData = {
      vendorId: items[0].vendorId,
      items: items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      })),
      specialInstructions: instructions,
      couponCode: appliedCoupon?.code || null,
    };

    createOrderMutation.mutate(orderData);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light p-4">
        <Icon name="shopping_cart" size={64} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Add some delicious items to your cart to get started
        </p>
        <Button variant="primary" onClick={() => navigate('/employee/menu')}>
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Icon name="arrow_back" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Cart</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Items Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Order</h3>
            <span className="text-primary text-sm font-medium">{itemCount} items</span>
          </div>

          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.menuItemId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div
                  className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">${(item.price * item.quantity).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Icon name="remove" size={16} />
                  </button>
                  <span className="text-base font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-light text-white transition-colors"
                  >
                    <Icon name="add" size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Coupon Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <label className="block mb-2">
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Apply Coupon</p>
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Enter promo code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <Button variant="primary" onClick={handleApplyCoupon}>
                Apply
              </Button>
            </div>
          </label>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Delivery Instructions</p>
          <textarea
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            placeholder="e.g. Leave at Desk 4B, use side entrance..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
          />
        </div>

        {/* Price Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Tax (8%)</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">${tax.toFixed(2)}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="local_offer" className="text-success" />
                <span className="text-success font-semibold">Coupon ({appliedCoupon.code})</span>
              </div>
              <span className="text-success font-bold">-${((subtotal * appliedCoupon.discount) / 100).toFixed(2)}</span>
            </div>
          )}
          {walletDeduction > 0 && (
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="account_balance_wallet" className="text-primary" />
                <span className="text-primary font-semibold">Wallet Deduction</span>
              </div>
              <span className="text-primary font-bold">-${walletDeduction.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total</span>
            <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-insets">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleConfirmOrder}
          loading={createOrderMutation.isLoading}
          icon={<Icon name="arrow_forward" />}
          iconPosition="right"
        >
          Confirm Order - ${finalTotal.toFixed(2)}
        </Button>
      </div>
    </div>
  );
};

export default CartPage;
