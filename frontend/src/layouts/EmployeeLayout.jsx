import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Clock, Wallet, User, Bell } from 'lucide-react';
import { useAuth, useCart, useOrderNotification } from '../contexts';
import Badge from '../common/components/Badge';

// Employee Layout with bottom navigation (mobile-first)
// Why bottom nav? Mobile UX best practice - thumb-friendly
const EmployeeLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartTotals } = useCart();
  const { unreadCount } = useOrderNotification();

  // Navigation items
  const navItems = [
    {
      path: '/employee/menu',
      icon: Home,
      label: 'Home',
    },
    {
      path: '/employee/cart',
      icon: ShoppingCart,
      label: 'Cart',
      badge: cartTotals.itemCount > 0 ? cartTotals.itemCount : null,
    },
    {
      path: '/employee/orders',
      icon: Clock,
      label: 'Orders',
    },
    {
      path: '/employee/wallet',
      icon: Wallet,
      label: 'Wallet',
    },
    {
      path: '/employee/profile',
      icon: User,
      label: 'Profile',
    },
  ];

  // Check if current path matches nav item
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top bar - for branding and notifications */}
      <header className="sticky top-0 z-40 glass border-b border-outline-variant/15 safe-top">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-primary">
              <Home className="w-4 h-4 text-on-primary" />
            </div>
            <div>
              <h1 className="font-headline text-body-lg text-on-surface">BiteDash</h1>
              <p className="text-label-sm text-on-surface-variant">Hi, {user?.name?.split(' ')[0] || 'User'}</p>
            </div>
          </div>

          {/* Notifications */}
          <button
            onClick={() => {/* TODO: Open notifications panel */}}
            className="relative p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <Bell size={20} className="text-on-surface-variant" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile-first, thumb-friendly */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-outline-variant/15 safe-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-touch transition-colors ${
                  active ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <div className="relative">
                  <Icon size={20} className={active ? 'text-primary' : 'text-current'} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-on-primary text-[10px] font-bold rounded-full px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold ${active ? 'text-primary' : 'text-current'}`}>
                  {item.label}
                </span>

                {/* Active indicator */}
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default EmployeeLayout;
