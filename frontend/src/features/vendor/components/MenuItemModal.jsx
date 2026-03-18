import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import toast from 'react-hot-toast';
import vendorService from '../services/vendorService';

const MenuItemModal = ({ item, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    imageUrl: '',
    prepTime: '',
    isVeg: false,
    available: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        category: item.category || 'Main Course',
        imageUrl: item.imageUrl || '',
        prepTime: item.prepTime || '',
        isVeg: item.isVeg || false,
        available: item.available !== undefined ? item.available : true,
      });
    }
  }, [item]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      item
        ? vendorService.updateMenuItem(item.id, data)
        : vendorService.createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success(item ? 'Item updated' : 'Item created');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save item');
    },
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    saveMutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
      prepTime: parseInt(formData.prepTime) || 15,
    });
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-modal">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {item ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Icon name="close" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Item Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={errors.name}
                  required
                  placeholder="e.g., Margherita Pizza"
                />

                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange('price')}
                  error={errors.price}
                  required
                  placeholder="12.99"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={handleChange('description')}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Describe your dish..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={handleChange('category')}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="Appetizers">Appetizers</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>

                <Input
                  label="Prep Time (mins)"
                  type="number"
                  value={formData.prepTime}
                  onChange={handleChange('prepTime')}
                  placeholder="15"
                />
              </div>

              <Input
                label="Image URL"
                value={formData.imageUrl}
                onChange={handleChange('imageUrl')}
                placeholder="https://example.com/image.jpg"
              />

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={handleChange('isVeg')}
                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Vegetarian
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={handleChange('available')}
                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Available
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={saveMutation.isLoading}
                  fullWidth
                >
                  {item ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

MenuItemModal.propTypes = {
  item: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default MenuItemModal;
