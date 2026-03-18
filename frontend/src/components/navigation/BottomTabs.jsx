import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../ui/Icon';

/**
 * BottomTabs - Mobile-first bottom navigation
 *
 * Provides thumb-friendly navigation for mobile devices
 * Shows active state with color and animation
 * Fixed at bottom of screen for easy access
 */
const BottomTabs = ({ tabs, role = 'employee' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if a tab is currently active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center flex-1 h-full min-w-[60px] max-w-[100px] transition-colors"
              aria-label={tab.label}
            >
              {/* Active indicator line */}
              {active && (
                <motion.div
                  layoutId={`active-tab-${role}`}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon */}
              <div className={`relative ${active ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                <Icon
                  name={tab.icon}
                  size={24}
                  fill={active ? 1 : 0}
                  weight={active ? 600 : 400}
                  className="transition-all duration-200"
                />

                {/* Badge for notifications/cart count */}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full px-1">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium mt-1 transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Ripple effect on tap */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                whileTap={{ scale: 0.95 }}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Predefined tab configurations for different roles
export const employeeTabs = [
  {
    label: 'Menu',
    path: '/employee/menu',
    icon: 'restaurant_menu',
  },
  {
    label: 'Orders',
    path: '/employee/orders',
    icon: 'receipt_long',
  },
  {
    label: 'Cart',
    path: '/employee/cart',
    icon: 'shopping_cart',
    badge: 0, // Will be dynamically updated
  },
  {
    label: 'Wallet',
    path: '/employee/wallet',
    icon: 'account_balance_wallet',
  },
];

export const vendorTabs = [
  {
    label: 'Dashboard',
    path: '/vendor/dashboard',
    icon: 'dashboard',
  },
  {
    label: 'Orders',
    path: '/vendor/orders',
    icon: 'shopping_bag',
    badge: 0, // Live order count
  },
  {
    label: 'Menu',
    path: '/vendor/menu',
    icon: 'restaurant',
  },
  {
    label: 'Scanner',
    path: '/vendor/qr-scanner',
    icon: 'qr_code_scanner',
  },
];

export const orgAdminTabs = [
  {
    label: 'Dashboard',
    path: '/org-admin/dashboard',
    icon: 'dashboard',
  },
  {
    label: 'Locations',
    path: '/org-admin/locations',
    icon: 'location_on',
  },
  {
    label: 'Approvals',
    path: '/org-admin/approvals',
    icon: 'check_circle',
    badge: 0, // Pending approvals count
  },
];

export default BottomTabs;
