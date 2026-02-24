import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Wallet,
  Loader2,
  IndianRupee,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import orderService from "../../services/orderService";
import walletService from "../../../../services/walletService";
import toast from "react-hot-toast";

const Cart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cartData, setCartData] = useState(null);
  const [cart, setCart] = useState({});

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('current_cart');
    if (savedCart) {
      const data = JSON.parse(savedCart);
      setCartData(data);
      setCart(data.items || {});
    }
  }, []);

  // Save cart changes to localStorage
  useEffect(() => {
    if (cartData && Object.keys(cart).length > 0) {
      const updatedCartData = {
        ...cartData,
        items: cart,
      };
      localStorage.setItem('current_cart', JSON.stringify(updatedCartData));
    }
  }, [cart, cartData]);

  // Fetch wallet balance
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      return await walletService.getBalance();
    },
    retry: 1,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      return await orderService.createOrder(orderData);
    },
    onSuccess: (data) => {
      toast.success('Order placed successfully!');
      // Clear cart
      localStorage.removeItem('current_cart');
      if (cartData?.vendorId) {
        localStorage.removeItem(`cart_${cartData.vendorId}`);
      }
      queryClient.invalidateQueries(['wallet-balance']);
      queryClient.invalidateQueries(['my-orders']);

      // Navigate to tracking page
      navigate('/employee/tracking');
    },
    onError: (error) => {
      toast.error(error || 'Failed to place order');
    },
  });

  const updateQuantity = (itemId, change) => {
    setCart(prev => {
      const currentQty = prev[itemId]?.quantity || 0;
      const newQty = currentQty + change;

      if (newQty <= 0) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          quantity: newQty,
        }
      };
    });
  };

  const removeItem = (itemId) => {
    setCart(prev => {
      const { [itemId]: removed, ...rest } = prev;
      return rest;
    });
    toast.success('Item removed from cart');
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getItemCount = () => {
    return Object.values(cart).reduce((count, item) => count + item.quantity, 0);
  };

  const handleCheckout = () => {
    const total = getCartTotal();

    if (balance < total) {
      toast.error('Insufficient wallet balance. Please top up your wallet.');
      return;
    }

    if (!cartData?.vendorId) {
      toast.error('Vendor information missing');
      return;
    }

    // Prepare order data
    const orderItems = Object.values(cart).map(item => ({
      menuItemId: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const orderData = {
      vendorId: parseInt(cartData.vendorId),
      orderItems,
      // totalAmount will be calculated by backend
    };

    createOrderMutation.mutate(orderData);
  };

  const cartItems = Object.values(cart);
  const total = getCartTotal();
  const itemCount = getItemCount();
  const hasSufficientBalance = balance >= total;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-surface-bg p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
            <p className="text-gray-600 mt-2">Review and checkout your items</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="text-gray-400" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
              <p className="text-gray-600 mb-6">
                Add items from vendors to get started with your order.
              </p>
              <button
                onClick={() => navigate('/employee/home')}
                className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-secondary transition-colors"
              >
                Browse Vendors
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-brand-primary transition-colors"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back
            </button>

            <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>

            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Items ({itemCount})
              </h2>

              <div className="space-y-4">
                {cartItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {/* Item Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
                      )}
                      <div className="flex items-center text-brand-primary font-bold mt-2">
                        <IndianRupee size={16} />
                        {item.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 hover:bg-gray-100 rounded-l-xl transition-colors"
                      >
                        <Minus size={16} className="text-gray-600" />
                      </button>
                      <span className="font-bold text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 hover:bg-gray-100 rounded-r-xl transition-colors"
                      >
                        <Plus size={16} className="text-gray-600" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="flex items-center text-lg font-bold text-gray-900 min-w-[100px]">
                      <IndianRupee size={18} />
                      {(item.price * item.quantity).toFixed(2)}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Wallet Balance */}
              <div className="mb-6 p-4 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wallet size={20} className="mr-2" />
                    <span className="font-semibold">Wallet Balance</span>
                  </div>
                  {balanceLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <div className="flex items-center font-bold text-lg">
                      <IndianRupee size={18} />
                      {balance?.toFixed(2) || '0.00'}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <div className="flex items-center font-semibold">
                    <IndianRupee size={16} />
                    {total.toFixed(2)}
                  </div>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax & Fees</span>
                  <span className="font-semibold">₹0.00</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6 text-xl font-bold">
                <span>Total</span>
                <div className="flex items-center text-brand-primary">
                  <IndianRupee size={22} />
                  {total.toFixed(2)}
                </div>
              </div>

              {/* Balance Warning */}
              {!hasSufficientBalance && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
                  <AlertTriangle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-1">
                      Insufficient Balance
                    </p>
                    <p className="text-xs text-red-600">
                      Please top up your wallet to complete this order.
                    </p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {hasSufficientBalance && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start">
                  <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      Ready to checkout!
                    </p>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={!hasSufficientBalance || createOrderMutation.isPending || balanceLoading}
                className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>

              {!hasSufficientBalance && (
                <button
                  onClick={() => navigate('/employee/wallet')}
                  className="w-full mt-3 py-3 bg-white border-2 border-brand-primary text-brand-primary font-bold rounded-xl hover:bg-orange-50 transition-colors"
                >
                  Top Up Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
