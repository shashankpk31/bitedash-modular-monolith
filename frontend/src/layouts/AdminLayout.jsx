import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, MapPin, CheckCircle, Settings, User, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts';
import Button from '../common/components/Button';
import { ROLES } from '../config/constants';

// Admin Layout - Shared layout for Org Admin and Super Admin
// Why? Both admin types need similar layout structure with different nav items
const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const isOrgAdmin = user?.role === ROLES.ORG_ADMIN;

  // Navigation items based on role
  const navItems = isSuperAdmin ? [
    {
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      path: '/admin/organizations',
      icon: Building2,
      label: 'Organizations',
    },
    {
      path: '/admin/settings',
      icon: Settings,
      label: 'Settings',
    },
  ] : [
    {
      path: '/org-admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      path: '/org-admin/locations',
      icon: MapPin,
      label: 'Locations',
    },
    {
      path: '/org-admin/approvals',
      icon: CheckCircle,
      label: 'Approvals',
    },
    {
      path: '/org-admin/employees',
      icon: Users,
      label: 'Employees',
    },
  ];

  // Check if current path matches nav item
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-surface-container-lowest border-r border-outline-variant/15">
        {/* Brand */}
        <div className="p-6 border-b border-outline-variant/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
              <Building2 className="w-5 h-5 text-on-primary" />
            </div>
            <div>
              <h1 className="font-headline text-headline-sm text-on-surface">BiteDash</h1>
              <p className="text-label-sm text-on-surface-variant">
                {isSuperAdmin ? 'Super Admin' : 'Admin Portal'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-primary text-on-primary shadow-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon size={20} />
                <span className="font-label text-label-lg">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-outline-variant/15">
          <div className="bg-surface-container rounded-xl p-3 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                <User size={20} className="text-on-surface-variant" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-headline text-body-md text-on-surface truncate">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-label-sm text-on-surface-variant truncate">
                  {user?.email || user?.phone}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              icon={<LogOut size={16} />}
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar - Mobile & Desktop */}
        <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant/15">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Mobile: Brand */}
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-primary">
                <Building2 className="w-4 h-4 text-on-primary" />
              </div>
              <h1 className="font-headline text-body-lg text-on-surface">
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </h1>
            </div>

            {/* Desktop: Page title */}
            <div className="hidden lg:block">
              {/* Page-specific title can be added here */}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-surface-container transition-colors">
                <Bell size={20} className="text-on-surface-variant" />
              </button>

              {/* Mobile: User menu trigger */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-surface-container transition-colors"
                onClick={() => navigate(isSuperAdmin ? '/admin/profile' : '/org-admin/profile')}
              >
                <User size={20} className="text-on-surface-variant" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Bottom Navigation - Mobile Only */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-outline-variant/15 safe-bottom">
          <div className="flex items-center justify-around h-16">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-touch transition-colors ${
                    active ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-semibold">{item.label.split(' ')[0]}</span>
                  {active && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AdminLayout;
