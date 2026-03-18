import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../../context/AuthContext';
import Icon from '../../../../components/ui/Icon';
import FoodCard from '../../../../components/ui/FoodCard';
import Badge from '../../../../components/ui/Badge';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { menuService } from '../../../../services';
import walletService from '../../../../services/walletService';

const EmployeeMenuHome = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('Main Campus - Floor 4');

  // Fetch wallet balance
  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletService.getMyWallet,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch menu items
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menu', 'employee'],
    queryFn: async () => {
      // TODO: Get actual vendor ID from user's location/cafeteria
      // For now using mock data
      return mockMenuItems;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch today's specials
  const { data: specials = [] } = useQuery({
    queryKey: ['specials'],
    queryFn: async () => mockSpecials,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const categories = [
    { name: 'All', icon: 'restaurant_menu' },
    { name: 'Fast Food', icon: 'fastfood' },
    { name: 'Healthy', icon: 'eco' },
    { name: 'Indian', icon: 'local_dining' },
    { name: 'Beverages', icon: 'local_cafe' },
  ];

  const handleAddToCart = (item) => {
    toast.success(`${item.name} added to cart!`);
    // TODO: Implement cart functionality
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg flex items-center justify-center text-white">
              <Icon name="restaurant_menu" fill={1} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
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
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-4 cursor-pointer">
          <Icon name="location_on" size={18} />
          <span className="text-sm font-medium">{selectedLocation}</span>
          <Icon name="expand_more" size={18} />
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              name="search"
              className="text-slate-400 group-focus-within:text-primary transition-colors"
              size={20}
            />
          </div>
          <input
            className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-800 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-slate-400 text-sm"
            placeholder="Search for your favorite meal..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Categories */}
      <section className="mt-4 px-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`
                flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-5 transition-all
                ${
                  selectedCategory === category.name
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700'
                }
              `}
            >
              {category.icon && selectedCategory !== 'All' && (
                <Icon name={category.icon} size={18} />
              )}
              <span className="text-sm font-semibold">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured/Specials Section */}
      {specials.length > 0 && (
        <section className="mt-8">
          <div className="px-4 flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
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
                  <Badge variant={special.badgeVariant} size="xs" className="w-fit mb-1">
                    {special.badgeText}
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
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
          {selectedCategory === 'All' ? 'Popular Items' : selectedCategory}
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="search_off" size={48} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                layout="horizontal"
              />
            ))}
          </div>
        )}
      </section>

      {/* Bottom padding for navigation */}
      <div className="h-20" />

      {/* Add CSS for no-scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

// Mock data (TODO: Replace with actual API calls)
const mockMenuItems = [
  {
    id: 1,
    name: 'Classic Angus Burger',
    description: 'Premium beef patty with cheddar, lettuce, tomato, and signature sauce.',
    price: 12.50,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isVeg: false,
    prepTime: '15-20',
    category: 'Fast Food',
    isAvailable: true,
  },
  {
    id: 2,
    name: 'Chicken Ramen Bowl',
    description: 'Steaming bowl of ramen with tender chicken, egg, and vegetables.',
    price: 14.00,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    isVeg: false,
    prepTime: '20-25',
    category: 'Asian',
    isAvailable: true,
  },
  {
    id: 3,
    name: 'Mediterranean Salad Bowl',
    description: 'Fresh greens, feta cheese, olives, cucumber, and balsamic dressing.',
    price: 11.00,
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    isVeg: true,
    isVegan: false,
    prepTime: '10-15',
    category: 'Healthy',
    isAvailable: true,
  },
  {
    id: 4,
    name: 'Butter Chicken with Naan',
    description: 'Creamy tomato-based curry with tender chicken, served with naan bread.',
    price: 13.50,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
    isVeg: false,
    prepTime: '25-30',
    category: 'Indian',
    isAvailable: true,
  },
  {
    id: 5,
    name: 'Cappuccino',
    description: 'Rich espresso with steamed milk and foam.',
    price: 4.50,
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400',
    isVeg: true,
    prepTime: '5',
    category: 'Beverages',
    isAvailable: true,
  },
];

const mockSpecials = [
  {
    id: 'special-1',
    name: 'Harvest Salmon Bowl',
    description: '20% off for Floor 4 employees',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    badgeText: 'PROMO',
    badgeVariant: 'promo',
  },
  {
    id: 'special-2',
    name: 'Truffle Mushroom Pizza',
    description: 'Fresh from the stone oven',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
    badgeText: 'NEW',
    badgeVariant: 'new',
  },
];

export default EmployeeMenuHome;
