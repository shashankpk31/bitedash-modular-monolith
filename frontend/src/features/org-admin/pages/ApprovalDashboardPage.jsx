import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Store, User, Mail, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../../../common/components/Button';
import Card, { CardContent } from '../../../common/components/Card';
import Badge from '../../../common/components/Badge';
import { ConfirmModal } from '../../../common/components/Modal';
import { ContentLoader } from '../../../common/components/Spinner';
import { useAuth } from '../../../contexts';
import { formatDateTime } from '../../../common/utils';
import { getPendingApprovals, updateUserStatus } from '../../../services/api/auth.api';
import { QUERY_KEYS } from '../../../config/constants';

// Approval Dashboard Page - Approve/reject pending vendors and employees
// Why? Org admins need to review and approve new vendors and employees
const ApprovalDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState('all'); // all, vendors, employees
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch pending approvals from backend
  const { data: pendingUsers = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.USERS, 'pending-approvals'],
    queryFn: getPendingApprovals,
  });

  // Transform backend user data to match component structure
  const pendingRequests = pendingUsers.map(user => ({
    id: user.id,
    type: user.role === 'ROLE_VENDOR' ? 'vendor' : 'employee',
    name: user.fullName,
    email: user.email || 'N/A',
    phone: user.phoneNumber || 'N/A',
    owner: user.fullName,
    location: 'N/A', // TODO: Fetch location name if needed
    cafeteria: 'N/A',
    office: 'N/A',
    department: 'N/A',
    designation: 'N/A',
    submittedAt: user.createdAt,
    businessType: user.shopName || 'N/A',
    shopName: user.shopName,
    employeeId: user.employeeId,
  }));

  // Filter requests
  const filteredRequests = pendingRequests.filter(req => {
    if (filterType === 'all') return true;
    return req.type === filterType.slice(0, -1); // Remove 's' from 'vendors'/'employees'
  });

  // Mutation for approving users
  const approveMutation = useMutation({
    mutationFn: (userId) => updateUserStatus(userId, 'ACTIVE'),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.USERS, 'pending-approvals']);
      setShowApproveModal(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      console.error('Failed to approve user:', error);
      alert('Failed to approve user. Please try again.');
    },
  });

  // Mutation for rejecting users
  const rejectMutation = useMutation({
    mutationFn: (userId) => updateUserStatus(userId, 'BLOCKED'),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.USERS, 'pending-approvals']);
      setShowRejectModal(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      console.error('Failed to reject user:', error);
      alert('Failed to reject user. Please try again.');
    },
  });

  // Handle actions
  const handleApprove = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const confirmApprove = () => {
    if (selectedRequest) {
      approveMutation.mutate(selectedRequest.id);
    }
  };

  const confirmReject = () => {
    if (selectedRequest) {
      rejectMutation.mutate(selectedRequest.id);
    }
  };

  // Stats
  const stats = {
    total: pendingRequests.length,
    vendors: pendingRequests.filter(r => r.type === 'vendor').length,
    employees: pendingRequests.filter(r => r.type === 'employee').length,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-outline-variant/15 bg-surface-container-low">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-headline text-display-sm text-on-surface">Approval Dashboard</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Review and approve pending requests
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-surface-container-lowest rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <Clock size={16} />
              <span className="text-label-sm uppercase">Total</span>
            </div>
            <div className="font-headline text-headline-lg text-on-surface">{stats.total}</div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Store size={16} />
              <span className="text-label-sm uppercase">Vendors</span>
            </div>
            <div className="font-headline text-headline-lg text-on-surface">{stats.vendors}</div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4">
            <div className="flex items-center gap-2 text-secondary mb-1">
              <User size={16} />
              <span className="text-label-sm uppercase">Employees</span>
            </div>
            <div className="font-headline text-headline-lg text-on-surface">{stats.employees}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          {[
            { value: 'all', label: 'All Requests' },
            { value: 'vendors', label: 'Vendors' },
            { value: 'employees', label: 'Employees' },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterType(filter.value)}
              className={`px-4 py-2 rounded-lg text-label-md font-semibold transition-colors ${
                filterType === filter.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Loading */}
        {isLoading && <ContentLoader message="Loading requests..." />}

        {/* Empty State */}
        {!isLoading && filteredRequests.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-container flex items-center justify-center">
              <CheckCircle size={40} className="text-on-surface-variant opacity-40" />
            </div>
            <div className="space-y-2">
              <h3 className="font-headline text-headline-sm text-on-surface">
                {filterType === 'all' ? 'No Pending Requests' : `No Pending ${filterType}`}
              </h3>
              <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
                All requests have been reviewed
              </p>
            </div>
          </div>
        )}

        {/* Requests Grid */}
        {!isLoading && filteredRequests.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRequests.map(request => (
                <motion.div
                  key={request.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card variant="elevated">
                    <CardContent>
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Icon */}
                        <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                          {request.type === 'vendor' ? (
                            <Store size={32} className="text-primary" />
                          ) : (
                            <User size={32} className="text-secondary" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-headline text-headline-sm text-on-surface">
                                  {request.name}
                                </h3>
                                <Badge variant={request.type === 'vendor' ? 'info' : 'warning'} size="sm">
                                  {request.type}
                                </Badge>
                              </div>
                              <p className="text-label-sm text-on-surface-variant">
                                Submitted {formatDateTime(request.submittedAt)}
                              </p>
                            </div>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-body-sm">
                              <Mail size={16} className="text-on-surface-variant" />
                              <span className="text-on-surface">{request.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-body-sm">
                              <Phone size={16} className="text-on-surface-variant" />
                              <span className="text-on-surface">{request.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-body-sm">
                              <MapPin size={16} className="text-on-surface-variant" />
                              <span className="text-on-surface">
                                {request.location}
                                {request.type === 'vendor' && ` - ${request.cafeteria}`}
                                {request.type === 'employee' && ` - ${request.office}`}
                              </span>
                            </div>
                            {request.type === 'vendor' && (
                              <div className="flex items-center gap-2 text-body-sm">
                                <Store size={16} className="text-on-surface-variant" />
                                <span className="text-on-surface">
                                  {request.businessType} • Owner: {request.owner}
                                </span>
                              </div>
                            )}
                            {request.type === 'employee' && (
                              <div className="flex items-center gap-2 text-body-sm">
                                <User size={16} className="text-on-surface-variant" />
                                <span className="text-on-surface">
                                  {request.designation} • {request.department}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button
                              variant="primary"
                              icon={<CheckCircle size={18} />}
                              onClick={() => handleApprove(request)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              icon={<XCircle size={18} />}
                              onClick={() => handleReject(request)}
                              className="border-error text-error hover:bg-error/10"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Approve Confirmation */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedRequest(null);
        }}
        onConfirm={confirmApprove}
        title="Approve Request?"
        message={`Are you sure you want to approve ${selectedRequest?.name}? They will be granted access to the system.`}
        confirmText="Approve"
        cancelText="Cancel"
        variant="primary"
      />

      {/* Reject Confirmation */}
      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedRequest(null);
        }}
        onConfirm={confirmReject}
        title="Reject Request?"
        message={`Are you sure you want to reject ${selectedRequest?.name}? This action cannot be undone.`}
        confirmText="Reject"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default ApprovalDashboardPage;
