import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, ShoppingCart, MapPin, Wallet, User } from 'lucide-react';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: Store,
      label: 'Home',
      path: '/employee/home',
    },
    {
      icon: ShoppingCart,
      label: 'Cart',
      path: '/employee/cart',
    },
    {
      icon: MapPin,
      label: 'Track',
      path: '/employee/tracking',
    },
    {
      icon: Wallet,
      label: 'Wallet',
      path: '/employee/wallet',
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20 md:hidden" />

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                  active
                    ? 'text-brand-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="relative">
                  <Icon
                    size={24}
                    className={active ? 'stroke-2' : 'stroke-1.5'}
                  />
                  {/* Cart Badge - Example */}
                  {item.path === '/employee/cart' && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      3
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    active ? 'font-semibold' : ''
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
