import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Utensils, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';
import Select from '../../../common/components/Select';
import Badge from '../../../common/components/Badge';
import Modal, { ConfirmModal } from '../../../common/components/Modal';
import { ContentLoader } from '../../../common/components/Spinner';
import { useVendorMenu } from '../../../services/queries/menu.queries';
import { createMenuItem, updateMenuItem, deleteMenuItem } from '../../../services/api/menu.api';
import { useAuth } from '../../../contexts';
import { formatCurrency } from '../../../common/utils';
import { QUERY_KEYS } from '../../../config/constants';
import { useVendorId } from '../hooks/useVendorId';

// Menu Management Page - CRUD operations for menu items
// Why? Vendors need to manage their menu offerings
const MenuManagementPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get vendor ID from backend
  const { vendorId, isLoading: vendorIdLoading } = useVendorId();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch menu items
  const { data: menuItems, isLoading: menuLoading } = useVendorMenu(vendorId);

  const isLoading = vendorIdLoading || menuLoading;

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEYS.MENU_BY_VENDOR(vendorId));
      setShowAddModal(false);
    },
    onError: (error) => {
      console.error('Failed to create menu item:', error);
      alert('Failed to create menu item. Please try again.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEYS.MENU_BY_VENDOR(vendorId));
      setShowEditModal(false);
      setSelectedItem(null);
    },
    onError: (error) => {
      console.error('Failed to update menu item:', error);
      alert('Failed to update menu item. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEYS.MENU_BY_VENDOR(vendorId));
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    },
    onError: (error) => {
      console.error('Failed to delete menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    },
  });

  // Filter items by search
  const filteredItems = menuItems?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle edit
  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      deleteMutation.mutate(selectedItem.id);
    }
  };

  // Menu Item Form Component
  const MenuItemForm = ({ item, onClose }) => {
    const [formData, setFormData] = useState(item || {
      name: '',
      description: '',
      price: '',
      category: '',
      isVegetarian: false,
      isAvailable: true,
    });

    const handleSubmit = (e) => {
      e.preventDefault();

      const menuItemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        isVeg: formData.isVegetarian,
        isAvailable: formData.isAvailable,
      };

      if (item) {
        // Update existing item
        updateMutation.mutate({ id: item.id, data: menuItemData });
      } else {
        // Create new item
        createMutation.mutate(menuItemData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Item Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g., Paneer Butter Masala"
        />

        <div>
          <label className="block text-label-md text-on-surface mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-surface-container-low text-on-surface rounded-xl p-4 border-2 border-outline-variant focus:border-primary focus:outline-none transition-colors min-h-[100px]"
            placeholder="Describe your dish..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price (₹)"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            placeholder="120"
          />

          <Select
            label="Category"
            placeholder="Select category"
            options={[
              { value: 'starters', label: 'Starters' },
              { value: 'main', label: 'Main Course' },
              { value: 'desserts', label: 'Desserts' },
              { value: 'beverages', label: 'Beverages' },
            ]}
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value })}
            icon={Tag}
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isVegetarian}
              onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
              className="w-5 h-5 rounded border-2 border-outline-variant accent-primary"
            />
            <span className="text-body-md text-on-surface">Vegetarian</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="w-5 h-5 rounded border-2 border-outline-variant accent-primary"
            />
            <span className="text-body-md text-on-surface">Available</span>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth>
            {item ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-outline-variant/30 bg-surface-container-low">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div>
            <h1 className="font-headline text-display-sm lg:text-display-md text-on-surface">
              Menu Management
            </h1>
            <p className="text-body-md lg:text-body-lg text-on-surface-variant mt-2">
              Manage your menu items and availability
            </p>
          </div>

          <Button
            variant="primary"
            icon={<Plus size={20} />}
            onClick={() => setShowAddModal(true)}
            className="lg:px-6 lg:py-3"
          >
            Add New Item
          </Button>
        </div>

        {/* Search */}
        <div className="mt-6">
          <Input
            type="search"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} />}
            iconPosition="left"
          />
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Loading */}
        {isLoading && <ContentLoader message="Loading menu..." />}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-16 lg:py-24 space-y-6">
            <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto rounded-2xl lg:rounded-3xl bg-surface-container flex items-center justify-center">
              <Utensils size={48} className="text-on-surface-variant opacity-40 lg:w-16 lg:h-16" />
            </div>
            <div className="space-y-3">
              <h3 className="font-headline text-headline-md lg:text-headline-lg text-on-surface">
                {searchQuery ? 'No Items Found' : 'No Menu Items Yet'}
              </h3>
              <p className="text-body-md lg:text-body-lg text-on-surface-variant max-w-md mx-auto">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add your first menu item to get started'}
              </p>
            </div>
            {!searchQuery && (
              <Button
                variant="primary"
                icon={<Plus size={20} />}
                onClick={() => setShowAddModal(true)}
              >
                Add New Item
              </Button>
            )}
          </div>
        )}

        {/* Items Table/Grid */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                layout
                className="bg-surface-container-lowest rounded-xl p-4 shadow-card hover:shadow-ambient transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-surface-container overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Utensils size={24} className="text-on-surface-variant opacity-20" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-headline text-body-lg text-on-surface line-clamp-1">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-body-sm text-on-surface-variant line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {item.isVegetarian && <Badge variant="success" size="sm">Veg</Badge>}
                        {!item.isAvailable && <Badge variant="error" size="sm">Out</Badge>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="font-headline text-headline-sm text-primary">
                        {formatCurrency(item.price)}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit size={16} />}
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={16} />}
                          onClick={() => handleDelete(item)}
                          className="text-error hover:bg-error/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Menu Item"
        size="lg"
      >
        <MenuItemForm onClose={() => setShowAddModal(false)} />
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        title="Edit Menu Item"
        size="lg"
      >
        <MenuItemForm
          item={selectedItem}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedItem(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Menu Item?"
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default MenuManagementPage;
