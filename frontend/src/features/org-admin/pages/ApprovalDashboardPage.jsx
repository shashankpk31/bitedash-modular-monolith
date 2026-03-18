import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import Card from '../../../components/ui/Card';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { orgAdminService } from '../services/orgAdminService';

const ApprovalDashboardPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: pendingApprovals = [], isLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: orgAdminService.getPendingApprovals,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => orgAdminService.updateUserStatus(userId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['pending-approvals']);
      toast.success(`User ${variables.status.toLowerCase()}d successfully`);
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const filteredApprovals = pendingApprovals.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);

    const matchesType =
      filterType === 'all' ? true :
      filterType === 'vendor' ? user.role === 'VENDOR' :
      filterType === 'employee' ? user.role === 'EMPLOYEE' :
      true;

    return matchesSearch && matchesType;
  });

  const handleApprove = (userId) => {
    updateStatusMutation.mutate({ userId, status: 'APPROVED' });
  };

  const handleReject = (userId) => {
    if (window.confirm('Are you sure you want to reject this user?')) {
      updateStatusMutation.mutate({ userId, status: 'REJECTED' });
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      VENDOR: 'primary',
      EMPLOYEE: 'info',
      ORG_ADMIN: 'warning',
    };
    return colors[role] || 'default';
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-6">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pending Approvals</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review and approve user registration requests
            </p>
          </div>
          <Badge variant="warning" size="lg">
            {pendingApprovals.length} Pending
          </Badge>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="px-6 py-4 space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          placeholder="Search by name, email, or phone..."
        />

        <div className="flex gap-2">
          {['all', 'vendor', 'employee'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                filterType === type
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals List */}
      <div className="px-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredApprovals.length === 0 ? (
          <Card padding="lg" className="text-center">
            <Icon name="check_circle" size={48} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No pending approvals</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredApprovals.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Icon
                        name={user.role === 'VENDOR' ? 'store' : 'person'}
                        size={24}
                        className="text-gray-600 dark:text-gray-400"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{user.name}</h3>
                        <Badge variant={getRoleColor(user.role)} size="sm">
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {user.email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.phone}
                      </p>
                    </div>
                  </div>

                  {user.role === 'VENDOR' && user.vendorName && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vendor Name</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user.vendorName}</p>
                      {user.cuisineType && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Cuisine: {user.cuisineType}
                        </p>
                      )}
                    </div>
                  )}

                  {user.role === 'EMPLOYEE' && user.department && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Department</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user.department}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Registered: {new Date(user.createdAt).toLocaleString()}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(user.id)}
                      icon={<Icon name="close" size={16} />}
                      fullWidth
                    >
                      Reject
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(user.id)}
                      icon={<Icon name="check" size={16} />}
                      fullWidth
                      loading={updateStatusMutation.isLoading}
                    >
                      Approve
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalDashboardPage;
