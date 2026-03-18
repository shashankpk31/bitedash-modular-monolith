import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import Icon from '../../../components/ui/Icon';
import SearchBar from '../../../components/ui/SearchBar';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import FoodCard from '../../../components/food/FoodCard';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { menuService } from '../../../services';
import walletService from '../../../services/walletService';

/**
 * Employee Menu Home Page
 *
 * Based on stitch design: employee_home_menu
 * Features:
 * - Search bar
 * - Category filters with icons
 * - Today's Specials carousel
 * - Popular Items grid
 * - Real-time menu data
 * - Cart integration
 */
const EmployeeMenuHome = () => {
  const { user } = useAuth();
  const { addItem, itemCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch wallet balance
  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletService.getMyWallet,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch promoted items (Today's Specials)
  const { data: specials = [], isLoading: loadingSpecials } = useQuery({
    queryKey: ['menu', 'promoted'],
    queryFn: menuService.getPromotedItems,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch popular items
  const { data: popularItems = [], isLoading: loadingPopular } = useQuery({
    queryKey: ['menu', 'popular'],
    queryFn: menuService.getPopularItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Category configuration
  const categories = [
    { name: 'All', icon: 'restaurant_menu' },
    { name: 'Fast Food', icon: 'fastfood' },
    { name: 'Healthy', icon: 'eco' },
    { name: 'Indian', icon: 'local_dining' },
    { name: 'Beverages', icon: 'local_cafe' },
    { name: 'Desserts', icon: 'cake' },
  ];

  const handleAddToCart = (item) => {
    const success = addItem(item, 1);
    if (success) {
      toast.success(`${item.name} added to cart!`);
    }
  };

  // Filter items based on search and category
  const filteredItems = popularItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isLoading = loadingSpecials || loadingPopular;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg flex items-center justify-center text-white">
              <Icon name="restaurant_menu" fill={1} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              BiteDash
            </h1>
          </div>

          {/* Wallet Balance */}
          <div className="bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/20">
            <Icon name="account_balance_wallet" className="text-primary" size={18} />
            <span className="text-sm font-bold text-primary">
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-4 cursor-pointer">
          <Icon name="location_on" size={18} />
          <span className="text-sm font-medium">
            {user?.location || 'Main Campus - Floor 4'}
          </span>
          <Icon name="expand_more" size={18} />
        </div>

        {/* Search Bar */}
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          placeholder="Search for your favorite meal..."
        />
      </header>

      {/* Categories */}
      <section className="mt-4 px-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {categories.map((category) => (
            <motion.button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              whileTap={{ scale: 0.95 }}
              className={`
                flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-5 font-semibold text-sm transition-all
                ${
                  selectedCategory === category.name
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-700'
                }
              `}
            >
              <Icon name={category.icon} size={18} />
              <span>{category.name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Featured/Specials Section */}
      {specials.length > 0 && (
        <section className="mt-8">
          <div className="px-4 flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Today's Specials
            </h2>
            <button className="text-sm font-semibold text-primary">See all</button>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4">
            {specials.map((special) => (
              <motion.div
                key={special.id}
                className="relative min-w-[280px] h-40 rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  alt={special.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={special.imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <Badge variant="promo" size="xs" className="w-fit mb-1">
                    SPECIAL
                  </Badge>
                  <h3 className="text-white font-bold text-lg">{special.name}</h3>
                  <p className="text-white/80 text-xs">{special.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Food List */}
      <section className="mt-8 px-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-4">
          {selectedCategory === 'All' ? 'Popular Items' : selectedCategory}
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="search_off" size={48} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No items found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-primary font-semibold"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                onAddToCart={() => handleAddToCart(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bottom padding for navigation */}
      <div className="h-20" />

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-20 right-4 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl shadow-primary/30 z-40"
          onClick={() => window.location.href = '/employee/cart'}
        >
          <Icon name="shopping_cart" fill={1} size={24} />
          <span className="absolute -top-1 -right-1 bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default EmployeeMenuHome;
