import { useState } from 'react';
import { TrendingUp, Building2, Users, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card from '../../../common/components/Card';
import Badge from '../../../common/components/Badge';
import { ContentLoader } from '../../../common/components/Spinner';
import { getSuperAdminStats, getAllOrganizations } from '../../../services/api/organization.api';
import { QUERY_KEYS } from '../../../config/constants';

const SuperAdminDashboardPage = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [QUERY_KEYS.ORGANIZATIONS, 'stats'],
    queryFn: getSuperAdminStats,
  });

  const { data: organizations = [], isLoading: orgsLoading } = useQuery({
    queryKey: QUERY_KEYS.ORGANIZATIONS,
    queryFn: getAllOrganizations,
  });

  const isLoading = statsLoading || orgsLoading;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-display-sm text-on-surface">Platform Overview</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Monitor all organizations and platform metrics
        </p>
      </div>

      {isLoading && <ContentLoader message="Loading dashboard..." />}

      {!isLoading && stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant uppercase mb-2">Total Organizations</p>
                    <h2 className="font-headline text-display-sm text-on-surface">{stats.totalOrganizations || 0}</h2>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 size={24} className="text-primary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant uppercase mb-2">Total Users</p>
                    <h2 className="font-headline text-display-sm text-on-surface">{stats.totalUsers || 0}</h2>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Users size={24} className="text-secondary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant uppercase mb-2">Total Vendors</p>
                    <h2 className="font-headline text-display-sm text-on-surface">{stats.totalVendors || 0}</h2>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
                    <Store size={24} className="text-tertiary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant uppercase mb-2">Pending Approvals</p>
                    <h2 className="font-headline text-display-sm text-on-surface">{stats.pendingVendors || 0}</h2>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <TrendingUp size={24} className="text-warning" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Organizations List */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline text-headline-md text-on-surface">Organizations</h2>
                <button
                  onClick={() => navigate('/admin/organizations')}
                  className="text-label-md text-primary hover:text-primary-dim"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {organizations.slice(0, 5).map(org => (
                  <div key={org.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-headline text-body-md text-on-surface">{org.name}</p>
                        {org.domain && <p className="text-label-sm text-on-surface-variant">{org.domain}</p>}
                      </div>
                    </div>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboardPage;
