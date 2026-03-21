import { useState } from 'react';
import { TrendingUp, Users, Store, MapPin, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card, { CardHeader, CardTitle, CardContent } from '../../../common/components/Card';
import Badge from '../../../common/components/Badge';
import { ContentLoader } from '../../../common/components/Spinner';
import { useAuth } from '../../../contexts';
import { formatCurrency } from '../../../common/utils';
import { getOrgAdminStats, getLocationsByOrganization } from '../../../services/api/organization.api';
import { QUERY_KEYS } from '../../../config/constants';

// Org Admin Dashboard - Overview of organization
// Why? Org admins need quick insights into their organization's operations
const OrgAdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('today'); // today, week, month

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [QUERY_KEYS.ORGANIZATIONS, 'admin-stats'],
    queryFn: getOrgAdminStats,
    enabled: !!user?.organizationId,
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: [QUERY_KEYS.LOCATIONS, user?.organizationId],
    queryFn: () => getLocationsByOrganization(user?.organizationId),
    enabled: !!user?.organizationId,
  });

  const isLoading = statsLoading || locationsLoading;

  // Time range filters
  const timeRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-headline text-display-sm text-on-surface">Organization Dashboard</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Overview of your organization's operations
          </p>
        </div>

        {/* Time range filter */}
        <div className="flex gap-2">
          {timeRanges.map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg text-label-md font-semibold transition-colors ${
                timeRange === range.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <ContentLoader message="Loading dashboard..." />}

      {!isLoading && stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Employees */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant uppercase mb-2">Total Employees</p>
                    <h2 className="font-headline text-display-sm text-on-surface">{stats.totalEmployees || 0}</h2>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users size={24} className="text-primary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Active Vendors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant uppercase mb-2">Active Vendors</p>
                    <h2 className="font-headline text-display-sm text-on-surface">{stats.activeVendors || 0}</h2>
                    <p className="text-label-sm text-on-surface-variant mt-2">
                      Across all locations
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Store size={24} className="text-secondary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Total Locations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant uppercase mb-2">Locations</p>
                    <h2 className="font-headline text-display-sm text-on-surface">{stats.totalLocations || 0}</h2>
                    <p className="text-label-sm text-on-surface-variant mt-2">
                      Offices & Cafeterias
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
                    <MapPin size={24} className="text-tertiary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Monthly Spend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant uppercase mb-2">Monthly Spend</p>
                    <h2 className="font-headline text-display-sm text-on-surface">
                      {formatCurrency(stats.monthlySpend || 0)}
                    </h2>
                    <p className="text-label-sm text-on-surface-variant mt-2">
                      {stats.totalOrders || 0} orders
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Pending Approvals Alert */}
          {stats.pendingApprovals > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card
                variant="elevated"
                className="border-2 border-yellow-500/20 cursor-pointer hover:shadow-ambient transition-shadow"
                onClick={() => navigate('/org-admin/approvals')}
              >
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                      <Clock size={24} className="text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-headline text-body-lg text-on-surface">
                        {stats.pendingApprovals} Pending Approvals
                      </h3>
                      <p className="text-body-sm text-on-surface-variant">
                        Review and approve vendor/employee requests
                      </p>
                    </div>
                    <CheckCircle size={24} className="text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Locations Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Locations List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Locations</CardTitle>
                  <button
                    onClick={() => navigate('/org-admin/locations')}
                    className="text-label-md text-primary hover:underline font-semibold"
                  >
                    Manage
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {locations.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-body-md text-on-surface-variant">No locations found</p>
                  </div>
                )}

                {locations.length > 0 && (
                  <div className="space-y-3">
                    {locations.map(location => (
                      <div
                        key={location.id}
                        className="p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
                        onClick={() => navigate(`/org-admin/locations/${location.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-headline text-body-md text-on-surface">{location.name}</h4>
                          <Badge variant="success" size="sm">Active</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-label-sm text-on-surface-variant">
                          <span>{location.address || 'No address'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/org-admin/locations')}
                    className="w-full p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-headline text-body-md text-on-surface">Manage Locations</p>
                        <p className="text-label-sm text-on-surface-variant">Add or edit locations</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/org-admin/approvals')}
                    className="w-full p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <CheckCircle size={20} className="text-secondary" />
                      </div>
                      <div>
                        <p className="font-headline text-body-md text-on-surface">Review Approvals</p>
                        <p className="text-label-sm text-on-surface-variant">Approve vendors & employees</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/org-admin/employees')}
                    className="w-full p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                        <Users size={20} className="text-tertiary" />
                      </div>
                      <div>
                        <p className="font-headline text-body-md text-on-surface">Manage Employees</p>
                        <p className="text-label-sm text-on-surface-variant">View employee list</p>
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

        </>
      )}
    </div>
  );
};

export default OrgAdminDashboardPage;
