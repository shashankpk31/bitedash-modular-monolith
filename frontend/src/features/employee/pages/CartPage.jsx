import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../common/components/Button';
import { ConfirmModal } from '../../../common/components/Modal';
import { useCart } from '../../../contexts';
import { useMyWallet } from '../../../services/queries/wallet.queries';
import { useCreateOrder } from '../../../services/queries/order.queries';
import { formatCurrency } from '../../../common/utils';

// Cart Page - Review and checkout
// Why? Critical step before order placement
const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartTotals,
    isEmpty,
    vendorId,
    locationContext,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { data: wallet } = useMyWallet();
  const createOrderMutation = useCreateOrder();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  // Check if user has sufficient balance
  const hasSufficientBalance = wallet?.balance >= cartTotals.total;

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setItemToRemove(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Handle item removal
  const handleRemoveItem = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove);
      setItemToRemove(null);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!hasSufficientBalance) {
      return;
    }

    // Prepare order data - MUST match OrderRequest.java
    const orderData = {
      items: cartItems.map(item => ({
        menuItemId: item.id,
        menuItemName: item.name,  // Backend expects menuItemName
        quantity: item.quantity,
        unitPrice: item.price,  // Backend expects unitPrice, not price
        // Optional fields (addonIds, customizations, notes) not needed for now
      })),
      vendorId: vendorId, // From cart context
      cafeteriaId: locationContext.cafeteriaId, // From cart location context
      officeId: locationContext.officeId, // From cart location context
      totalAmount: cartTotals.total,
      orderType: 'DINE_IN', // Default order type
      // Optional: scheduledTime, specialInstructions
    };

    createOrderMutation.mutate(orderData);
  };

  // Empty cart state
  if (isEmpty) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-surface-container flex items-center justify-center">
            <ShoppingCart size={48} className="text-on-surface-variant opacity-40" />
          </div>
          <div className="space-y-2">
            <h2 className="font-headline text-headline-lg text-on-surface">
              Your Cart is Empty
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Add items from your favorite vendors to get started
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/employee/menu')}
          >
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-32">
      {/* Header */}
      <div className="p-4 bg-surface-container-low border-b border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-display-sm text-on-surface">Your Cart</h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {cartTotals.itemCount} item{cartTotals.itemCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            className="text-error hover:bg-error/10"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-4 space-y-3">
        <AnimatePresence>
          {cartItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-surface-container-lowest rounded-xl p-4 shadow-card"
            >
              <div className="flex gap-4">
                {/* Item Image */}
                <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-surface-container overflow-hidden">
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
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline text-body-lg text-on-surface line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-label-md text-primary font-semibold mt-1">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => setItemToRemove(item.id)}
                      className="p-2 -mr-2 rounded-lg hover:bg-error/10 transition-colors"
                    >
                      <Trash2 size={16} className="text-error" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-surface-container rounded-lg p-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-md hover:bg-surface-container-high flex items-center justify-center transition-colors"
                      >
                        <Minus size={16} className="text-on-surface" />
                      </button>
                      <span className="font-headline text-body-md text-on-surface min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-md hover:bg-surface-container-high flex items-center justify-center transition-colors"
                      >
                        <Plus size={16} className="text-on-surface" />
                      </button>
                    </div>

                    {/* Item total */}
                    <div className="text-body-md text-on-surface-variant">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bill Summary - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant/15 p-4 space-y-4 safe-bottom">
        {/* Bill Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-body-md">
            <span className="text-on-surface-variant">Subtotal</span>
            <span className="text-on-surface">{formatCurrency(cartTotals.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-body-md">
            <span className="text-on-surface-variant">GST (5%)</span>
            <span className="text-on-surface">{formatCurrency(cartTotals.tax)}</span>
          </div>
          <div className="h-px bg-outline-variant/15 my-2" />
          <div className="flex items-center justify-between">
            <span className="font-headline text-headline-sm text-on-surface">Total</span>
            <span className="font-headline text-headline-lg text-primary">
              {formatCurrency(cartTotals.total)}
            </span>
          </div>
        </div>

        {/* Wallet Balance Warning */}
        {!hasSufficientBalance && (
          <div className="flex items-start gap-3 p-3 bg-error/10 rounded-xl">
            <AlertCircle size={20} className="text-error flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-error font-semibold">Insufficient Balance</p>
              <p className="text-label-sm text-on-surface-variant mt-1">
                Your wallet balance: {formatCurrency(wallet?.balance || 0)}. Please add funds to continue.
              </p>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleCheckout}
          disabled={!hasSufficientBalance || createOrderMutation.isPending}
          loading={createOrderMutation.isPending}
        >
          {createOrderMutation.isPending
            ? 'Placing Order...'
            : hasSufficientBalance
            ? 'Place Order'
            : 'Insufficient Balance'}
        </Button>

        {/* Wallet balance display */}
        <div className="text-center text-label-sm text-on-surface-variant">
          Wallet Balance: {formatCurrency(wallet?.balance || 0)}
        </div>
      </div>

      {/* Clear Cart Confirmation */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          clearCart();
          setShowClearConfirm(false);
        }}
        title="Clear Cart?"
        message="Are you sure you want to remove all items from your cart?"
        confirmText="Clear Cart"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Remove Item Confirmation */}
      <ConfirmModal
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={handleRemoveItem}
        title="Remove Item?"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default CartPage;
