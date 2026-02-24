import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Store,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  IndianRupee
} from "lucide-react";
import catalogService from "../../services/catalogService";
import toast from "react-hot-toast";

const VendorDetail = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${vendorId}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [vendorId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(cart).length > 0) {
      localStorage.setItem(`cart_${vendorId}`, JSON.stringify(cart));
    } else {
      localStorage.removeItem(`cart_${vendorId}`);
    }
  }, [cart, vendorId]);

  // Fetch vendor rating
  const { data: rating } = useQuery({
    queryKey: ['vendor-rating', vendorId],
    queryFn: async () => {
      try {
        return await catalogService.getVendorRating(vendorId);
      } catch (err) {
        return null;
      }
    },
    retry: 1,
  });

  // Fetch vendor categories and menu items
  const {
    data: categories,
    isLoading,
    error
  } = useQuery({
    queryKey: ['vendor-categories', vendorId],
    queryFn: async () => {
      return await catalogService.getVendorCategories(vendorId, true);
    },
    retry: 1,
  });

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + 1,
      }
    }));
    toast.success(`Added ${item.name} to cart`);
  };

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

  const getCartTotal = () => {
    return Object.values(cart).reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((count, item) => count + item.quantity, 0);
  };

  const handleViewCart = () => {
    // Save cart with vendor info for the cart page
    const cartData = {
      vendorId,
      items: cart,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('current_cart', JSON.stringify(cartData));
    navigate('/employee/cart');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-brand-primary mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Menu</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = categories?.reduce((sum, cat) => sum + (cat.menuItems?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-surface-bg pb-24">
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

            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mr-3">
                <Store className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Vendor Menu</h1>
                {rating && (
                  <div className="flex items-center text-sm">
                    <Star className="text-yellow-400 fill-yellow-400 mr-1" size={14} />
                    <span className="font-semibold">{rating.averageRating?.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({rating.totalOrders} orders)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-primary'
              }`}
            >
              All ({totalItems})
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-primary'
                }`}
              >
                {category.name} ({category.menuItems?.length || 0})
              </button>
            ))}
          </div>
        )}

        {/* Menu Items */}
        {!categories || categories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Menu Items</h3>
            <p className="text-gray-600">This vendor hasn't added any items yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories
              .filter(cat => selectedCategory === null || cat.id === selectedCategory)
              .map(category => (
                <div key={category.id} className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.menuItems?.map(item => {
                      const cartItem = cart[item.id];
                      const inCart = !!cartItem;

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                              {item.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-brand-primary font-bold text-lg">
                              <IndianRupee size={18} />
                              {item.price.toFixed(2)}
                            </div>

                            {!item.available ? (
                              <span className="text-sm text-gray-500 font-semibold">Unavailable</span>
                            ) : inCart ? (
                              <div className="flex items-center gap-2 bg-brand-primary text-white rounded-xl">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="p-2 hover:bg-brand-secondary rounded-l-xl transition-colors"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="font-bold min-w-[2rem] text-center">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="p-2 hover:bg-brand-secondary rounded-r-xl transition-colors"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(item)}
                                className="px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-colors flex items-center font-semibold"
                              >
                                <Plus size={16} className="mr-1" />
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 sm:px-6 z-20">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleViewCart}
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-4 px-6 rounded-2xl shadow-2xl transition-all flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="bg-white/20 rounded-xl p-2 mr-3">
                  <ShoppingCart size={24} />
                </div>
                <span className="text-lg">View Cart ({getCartItemCount()} items)</span>
              </div>
              <div className="flex items-center text-lg">
                <IndianRupee size={20} />
                {getCartTotal().toFixed(2)}
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDetail;
