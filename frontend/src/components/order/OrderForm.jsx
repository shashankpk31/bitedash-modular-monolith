import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Package, Clock, MessageSquare, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

function OrderForm({ cartItems, totalAmount, onSubmit, submitting = false }) {
  const [orderType, setOrderType] = useState('DINE_IN');
  const [scheduledTime, setScheduledTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const orderTypes = [
    { value: 'DINE_IN', label: 'Dine In', icon: '🍽️' },
    { value: 'TAKEAWAY', label: 'Takeaway', icon: '🥡' },
    { value: 'DELIVERY', label: 'Delivery', icon: '🚚' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const orderData = {
      orderType,
      scheduledTime: scheduledTime || null,
      specialInstructions: specialInstructions.trim() || null,
      totalAmount,
      items: cartItems.map((item) => ({
        menuItemId: item.id,
        menuItemName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        customizations: item.customizations || null,
        notes: item.notes || null,
      })),
    };

    onSubmit(orderData);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <Package size={18} />
            Order Type
          </div>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {orderTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setOrderType(type.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                orderType === type.value
                  ? 'border-brand-primary bg-orange-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div
                className={`text-sm font-medium ${
                  orderType === type.value ? 'text-brand-primary' : 'text-gray-700'
                }`}
              >
                {type.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {}
      <div>
        <label
          htmlFor="scheduledTime"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          <div className="flex items-center gap-2">
            <Clock size={18} />
            Schedule for Later (Optional)
          </div>
        </label>
        <input
          type="datetime-local"
          id="scheduledTime"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          min={getMinDateTime()}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-800"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty for immediate order. Scheduled orders must be at least 30 minutes
          in advance.
        </p>
      </div>

      {}
      <div>
        <label
          htmlFor="specialInstructions"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={18} />
            Special Instructions (Optional)
          </div>
        </label>
        <textarea
          id="specialInstructions"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="E.g., Extra spicy, no onions, extra cheese, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none text-gray-800 placeholder-gray-400"
        />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {specialInstructions.length}/500 characters
        </p>
      </div>

      {}
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Order Summary</h4>

        {}
        <div className="space-y-2">
          {cartItems?.slice(0, 3).map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium text-gray-800">
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          {cartItems?.length > 3 && (
            <p className="text-xs text-gray-500">
              +{cartItems.length - 3} more items
            </p>
          )}
        </div>

        {}
        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
          <span className="font-semibold text-gray-800">Total Amount</span>
          <span className="text-xl font-bold text-brand-primary">
            ₹{totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {}
      <Button
        type="submit"
        disabled={submitting || !cartItems || cartItems.length === 0}
        className="w-full flex items-center justify-center gap-2 py-4"
      >
        {submitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            Placing Order...
          </>
        ) : (
          <>
            <ShoppingCart size={20} />
            Place Order - ₹{totalAmount.toFixed(2)}
          </>
        )}
      </Button>

      {}
      <p className="text-xs text-gray-500 text-center">
        By placing this order, you agree to our terms and conditions
      </p>
    </form>
  );
}

export default OrderForm;
