import { User, Store, MapPin, Phone, Mail, Clock, LogOut, Bell, Shield, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Button from '../../../common/components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../../common/components/Card';
import Badge from '../../../common/components/Badge';
import { ContentLoader } from '../../../common/components/Spinner';
import { useAuth } from '../../../contexts';
import { getMyVendor, getMyVendorStats } from '../../../services/api/organization.api';
import { QUERY_KEYS } from '../../../config/constants';

// Vendor Profile Page - View profile and settings
// Why? Vendors need to see their account info and manage preferences
const VendorProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch vendor profile
  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: [QUERY_KEYS.VENDORS, 'my-profile'],
    queryFn: getMyVendor,
  });

  // Fetch vendor statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [QUERY_KEYS.VENDORS, 'my-stats'],
    queryFn: getMyVendorStats,
  });

  const isLoading = vendorLoading || statsLoading;

  // Transform vendor data to match component structure
  const vendorData = vendor ? {
    name: vendor.name || user?.fullName || 'Vendor Name',
    email: user?.email || 'vendor@example.com',
    phone: vendor.contactNumber || user?.phoneNumber || '+91 9876543210',
    stallName: vendor.name || 'Vendor Stall',
    status: vendor.isActive ? 'ACTIVE' : 'INACTIVE',
    contactPerson: vendor.contactPerson || user?.fullName,
    // Stats from API (VendorStatsResponse)
    totalOrders: stats?.totalOrders || 0,
    revenue: stats?.totalRevenue || 0,
    activeMenuItems: stats?.activeMenuItems || 0,
    totalMenuItems: stats?.totalMenuItems || 0,
    rating: stats?.rating || 0,
    activeOrders: stats?.activeOrders || 0,
    completedToday: stats?.completedToday || 0,
    avgOrderValue: stats?.avgOrderValue || 0,
    // Dates
    joinedDate: vendor.createdAt || new Date().toISOString(),
  } : null;

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Show loading state
  if (isLoading) {
    return <ContentLoader message="Loading vendor profile..." />;
  }

  // Show error state if no vendor data
  if (!vendorData) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-container flex items-center justify-center">
            <User size={40} className="text-on-surface-variant opacity-40" />
          </div>
          <div className="space-y-2">
            <h3 className="font-headline text-headline-sm text-on-surface">
              No Vendor Profile Found
            </h3>
            <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
              Unable to load vendor profile. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-headline text-display-sm text-on-surface">Profile & Settings</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card variant="elevated">
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Avatar */}
                <div className="flex flex-col items-center lg:items-start gap-3">
                  <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center shadow-primary">
                    <User size={48} className="text-on-primary" />
                  </div>
                  <Badge variant={vendorData.status === 'ACTIVE' ? 'success' : 'error'}>
                    {vendorData.status}
                  </Badge>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="font-headline text-headline-lg text-on-surface">
                      {vendorData.name}
                    </h2>
                    <p className="text-body-md text-on-surface-variant mt-1 flex items-center gap-2">
                      <Store size={16} />
                      {vendorData.stallName}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                        <Mail size={18} className="text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="text-label-sm text-on-surface-variant">Email</p>
                        <p className="text-body-md text-on-surface">{vendorData.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                        <Phone size={18} className="text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="text-label-sm text-on-surface-variant">Phone</p>
                        <p className="text-body-md text-on-surface">{vendorData.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                        <User size={18} className="text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="text-label-sm text-on-surface-variant">Contact Person</p>
                        <p className="text-body-md text-on-surface">
                          {vendorData.contactPerson || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                        <Clock size={18} className="text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="text-label-sm text-on-surface-variant">Member Since</p>
                        <p className="text-body-md text-on-surface">
                          {formatDate(vendorData.joinedDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent>
              <div className="text-center py-4">
                <div className="font-headline text-display-sm text-primary">
                  {vendorData.rating ? vendorData.rating.toFixed(1) : '0.0'} ⭐
                </div>
                <p className="text-label-md text-on-surface-variant mt-2 uppercase">
                  Rating
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-center py-4">
                <div className="font-headline text-display-sm text-on-surface">
                  {vendorData.totalOrders.toLocaleString()}
                </div>
                <p className="text-label-md text-on-surface-variant mt-2 uppercase">
                  Orders
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-center py-4">
                <div className="font-headline text-display-sm text-success">
                  ₹{(vendorData.revenue / 1000).toFixed(1)}K
                </div>
                <p className="text-label-md text-on-surface-variant mt-2 uppercase">
                  Revenue
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-center py-4">
                <div className="font-headline text-display-sm text-on-surface">
                  {vendorData.activeMenuItems}
                </div>
                <p className="text-label-md text-on-surface-variant mt-2 uppercase">
                  Menu Items
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Notifications */}
                <button className="w-full flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bell size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-headline text-body-md text-on-surface">Notifications</p>
                      <p className="text-label-sm text-on-surface-variant">
                        Manage notification preferences
                      </p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                    <span className="text-on-primary text-xs font-bold">→</span>
                  </div>
                </button>

                {/* Security */}
                <button className="w-full flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Shield size={20} className="text-secondary" />
                    </div>
                    <div>
                      <p className="font-headline text-body-md text-on-surface">
                        Security & Privacy
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        Password and security settings
                      </p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center">
                    <span className="text-on-secondary text-xs font-bold">→</span>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            size="lg"
            fullWidth
            icon={<LogOut size={20} />}
            onClick={handleLogout}
            className="border-error text-error hover:bg-error/10"
          >
            Logout
          </Button>
        </motion.div>

        {/* App Version */}
        <div className="text-center pb-4">
          <p className="text-label-sm text-on-surface-variant">
            BiteDash Vendor v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;
