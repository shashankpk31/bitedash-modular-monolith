import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Building2, Users, MapPin, DollarSign, Mail, Phone, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';
import Badge from '../../../common/components/Badge';
import Modal, { ConfirmModal } from '../../../common/components/Modal';
import { ContentLoader } from '../../../common/components/Spinner';
import { formatCurrency, isValidEmail, isValidPhone } from '../../../common/utils';
import { getAllOrganizations, createOrganization } from '../../../services/api/organization.api';
import { QUERY_KEYS } from '../../../config/constants';

// Organization Manager Page - CRUD for organizations
// Why? Super admins need to manage all organizations on the platform
const OrganizationManagerPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  const queryClient = useQueryClient();

  // Fetch organizations from backend
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.ORGANIZATIONS,
    queryFn: getAllOrganizations,
  });

  // Create organization mutation
  const createOrgMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      toast.success('Organization created successfully!');
      queryClient.invalidateQueries(QUERY_KEYS.ORGANIZATIONS);
      setShowAddModal(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create organization');
    },
  });

  // Filter organizations
  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          org.adminName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: organizations.length,
    active: organizations.filter(o => o.status === 'active').length,
    inactive: organizations.filter(o => o.status === 'inactive').length,
  };

  // Handle actions
  const handleAdd = () => {
    setSelectedOrg(null);
    setShowAddModal(true);
  };

  const handleEdit = (org) => {
    setSelectedOrg(org);
    setShowEditModal(true);
  };

  const handleDelete = (org) => {
    setSelectedOrg(org);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    toast.error('Delete functionality not yet implemented');
    setShowDeleteConfirm(false);
    setSelectedOrg(null);
  };

  // Organization Form Component
  const OrganizationForm = ({ org, onClose }) => {
    const [formData, setFormData] = useState({
      name: '',
      domain: '',
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      role: 'ROLE_ORG_ADMIN',
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
      const newErrors = {};

      if (!formData.name.trim()) newErrors.name = 'Organization name required';
      if (!formData.fullName.trim()) newErrors.fullName = 'Admin name required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email required';
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = 'Invalid email';
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.phoneNumber && !isValidPhone(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Invalid phone number';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!validate()) return;

      createOrgMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 p-4 bg-surface-container rounded-xl">
          <h3 className="font-headline text-headline-sm text-on-surface">Organization Details</h3>

          <Input
            label="Organization Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
            placeholder="e.g., TechCorp Inc."
            icon={<Building2 size={18} />}
          />

          <Input
            label="Domain (Optional)"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            placeholder="e.g., techcorp.com"
          />
        </div>

        <div className="space-y-4 p-4 bg-surface-container rounded-xl">
          <h3 className="font-headline text-headline-sm text-on-surface">Admin User Details</h3>

          <Input
            label="Admin Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={errors.fullName}
            required
            placeholder="John Doe"
            icon={<User size={18} />}
          />

          <Input
            label="Admin Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
            placeholder="admin@organization.com"
            icon={<Mail size={18} />}
          />

          <Input
            label="Admin Phone"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            error={errors.phoneNumber}
            placeholder="9876543210"
            helperText="10-digit Indian mobile number"
            icon={<Phone size={18} />}
          />

          <Input
            label="Admin Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            required
            placeholder="Minimum 6 characters"
            helperText="Admin will use this to login"
            icon={<Lock size={18} />}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={createOrgMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={createOrgMutation.isPending}
            disabled={createOrgMutation.isPending}
          >
            {createOrgMutation.isPending ? 'Creating...' : 'Create Organization'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-outline-variant/15 bg-surface-container-low">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-headline text-display-sm text-on-surface">Organizations</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Manage all organizations on the platform
            </p>
          </div>

          <Button
            variant="primary"
            icon={<Plus size={20} />}
            onClick={handleAdd}
          >
            Add Organization
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-surface-container-lowest rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Building2 size={16} />
              <span className="text-label-sm uppercase">Total</span>
            </div>
            <div className="font-headline text-headline-lg text-on-surface">{stats.total}</div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Building2 size={16} />
              <span className="text-label-sm uppercase">Active</span>
            </div>
            <div className="font-headline text-headline-lg text-on-surface">{stats.active}</div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4">
            <div className="flex items-center gap-2 text-on-surface-variant mb-1">
              <Building2 size={16} />
              <span className="text-label-sm uppercase">Inactive</span>
            </div>
            <div className="font-headline text-headline-lg text-on-surface">{stats.inactive}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 mt-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={18} />}
              iconPosition="left"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-label-md font-semibold transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Organizations List */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Loading */}
        {isLoading && <ContentLoader message="Loading organizations..." />}

        {/* Empty State */}
        {!isLoading && filteredOrgs.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-container flex items-center justify-center">
              <Building2 size={40} className="text-on-surface-variant opacity-40" />
            </div>
            <div className="space-y-2">
              <h3 className="font-headline text-headline-sm text-on-surface">
                {searchQuery ? 'No Organizations Found' : 'No Organizations Yet'}
              </h3>
              <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add your first organization to get started'}
              </p>
            </div>
            {!searchQuery && (
              <Button
                variant="primary"
                icon={<Plus size={20} />}
                onClick={handleAdd}
              >
                Add Organization
              </Button>
            )}
          </div>
        )}

        {/* Organizations Grid */}
        {!isLoading && filteredOrgs.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredOrgs.map(org => (
                <motion.div
                  key={org.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-surface-container-lowest rounded-xl p-4 shadow-card hover:shadow-ambient transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Icon */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 size={32} className="text-primary" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-headline text-headline-sm text-on-surface">
                              {org.name}
                            </h3>
                            <Badge variant={org.status === 'active' ? 'success' : 'error'} size="sm">
                              {org.status}
                            </Badge>
                          </div>
                          <p className="text-label-sm text-on-surface-variant">
                            Admin: {org.adminName} • {org.adminEmail}
                          </p>
                        </div>
                      </div>

                      {/* Organization Info */}
                      <div className="space-y-2">
                        {org.domain && (
                          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                            <span className="font-semibold">Domain:</span>
                            <span>{org.domain}</span>
                          </div>
                        )}
                        {org.createdAt && (
                          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                            <span className="font-semibold">Created:</span>
                            <span>{new Date(org.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit size={16} />}
                          onClick={() => toast.info('Edit functionality coming soon')}
                          disabled
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={16} />}
                          onClick={() => handleDelete(org)}
                          className="text-error hover:bg-error/10"
                          disabled
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Organization"
        size="lg"
      >
        <OrganizationForm onClose={() => setShowAddModal(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOrg(null);
        }}
        title="Edit Organization"
        size="lg"
      >
        <OrganizationForm
          org={selectedOrg}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOrg(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedOrg(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Organization?"
        message={`Are you sure you want to delete "${selectedOrg?.name}"? This will remove all associated data including employees, vendors, and locations. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default OrganizationManagerPage;
