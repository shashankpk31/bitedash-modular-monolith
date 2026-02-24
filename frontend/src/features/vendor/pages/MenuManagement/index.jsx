import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  IndianRupee,
  Tag,
  ToggleLeft,
  ToggleRight,
  Grid,
  List
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import vendorService from "../../services/vendorService";
import Modal from "../../../../components/ui/Modal";
import Input from "../../../../components/ui/Input";
import toast from "react-hot-toast";

const MenuManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    available: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  // Fetch menu items
  const {
    data: menuItems,
    isLoading: itemsLoading,
    error: itemsError
  } = useQuery({
    queryKey: ['vendor-menu-items', user?.id],
    queryFn: async () => {
      return await vendorService.getMyMenuItems(user.id);
    },
    enabled: !!user?.id,
    retry: 1,
  });

  // Fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['vendor-categories', user?.id],
    queryFn: async () => {
      return await vendorService.getMyCategories(user.id, false);
    },
    enabled: !!user?.id,
    retry: 1,
  });

  // Create/Update Menu Item
  const itemMutation = useMutation({
    mutationFn: async (data) => {
      if (editingItem) {
        return await vendorService.updateMenuItem(editingItem.id, data);
      } else {
        return await vendorService.createMenuItem(data);
      }
    },
    onSuccess: () => {
      toast.success(editingItem ? 'Menu item updated!' : 'Menu item created!');
      queryClient.invalidateQueries(['vendor-menu-items']);
      handleCloseItemModal();
    },
    onError: (error) => {
      toast.error(error || 'Failed to save menu item');
    },
  });

  // Delete Menu Item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId) => {
      return await vendorService.deleteMenuItem(itemId);
    },
    onSuccess: () => {
      toast.success('Menu item deleted');
      queryClient.invalidateQueries(['vendor-menu-items']);
    },
    onError: (error) => {
      toast.error(error || 'Failed to delete menu item');
    },
  });

  // Create/Update Category
  const categoryMutation = useMutation({
    mutationFn: async (data) => {
      if (editingCategory) {
        return await vendorService.updateCategory(editingCategory.id, data);
      } else {
        return await vendorService.createCategory(data);
      }
    },
    onSuccess: () => {
      toast.success(editingCategory ? 'Category updated!' : 'Category created!');
      queryClient.invalidateQueries(['vendor-categories']);
      handleCloseCategoryModal();
    },
    onError: (error) => {
      toast.error(error || 'Failed to save category');
    },
  });

  // Toggle availability
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ itemId, available }) => {
      const item = menuItems.find(i => i.id === itemId);
      return await vendorService.updateMenuItem(itemId, {
        ...item,
        available,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['vendor-menu-items']);
    },
    onError: (error) => {
      toast.error(error || 'Failed to update availability');
    },
  });

  const handleOpenItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        categoryId: item.categoryId?.toString() || '',
        available: item.available,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        price: '',
        categoryId: selectedCategory?.toString() || '',
        available: true,
      });
    }
    setShowItemModal(true);
  };

  const handleCloseItemModal = () => {
    setShowItemModal(false);
    setEditingItem(null);
    setItemForm({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      available: true,
    });
  };

  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        description: '',
      });
    }
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
    });
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    const data = {
      name: itemForm.name,
      description: itemForm.description || null,
      price: parseFloat(itemForm.price),
      categoryId: itemForm.categoryId ? parseInt(itemForm.categoryId) : null,
      available: itemForm.available,
    };
    itemMutation.mutate(data);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    categoryMutation.mutate(categoryForm);
  };

  const handleDeleteItem = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteItemMutation.mutate(item.id);
    }
  };

  const handleToggleAvailability = (item) => {
    toggleAvailabilityMutation.mutate({
      itemId: item.id,
      available: !item.available,
    });
  };

  const filteredItems = selectedCategory
    ? menuItems?.filter(item => item.categoryId === selectedCategory)
    : menuItems;

  if (itemsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-brand-primary mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (itemsError) {
    return (
      <div className="min-h-screen bg-surface-bg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Menu</h3>
            <p className="text-gray-600">{itemsError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="text-gray-600 mt-2">
                Manage your menu items, pricing, and availability
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleOpenCategoryModal()}
                className="px-4 py-2 border-2 border-brand-primary text-brand-primary font-semibold rounded-xl hover:bg-orange-50 transition-colors flex items-center"
              >
                <Tag className="mr-2" size={20} />
                Add Category
              </button>
              <button
                onClick={() => handleOpenItemModal()}
                className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-secondary transition-colors flex items-center"
              >
                <Plus className="mr-2" size={20} />
                Add Menu Item
              </button>
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === null
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-primary'
                }`}
              >
                All ({menuItems?.length || 0})
              </button>
              {categories?.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-brand-primary text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-primary'
                  }`}
                >
                  {category.name} ({menuItems?.filter(i => i.categoryId === category.id).length || 0})
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-primary'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === 'list'
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-primary'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {!filteredItems || filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="text-brand-primary" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedCategory ? 'No Items in This Category' : 'No Menu Items Yet'}
              </h2>
              <p className="text-gray-600 mb-6">
                {selectedCategory
                  ? 'Add menu items to this category to get started.'
                  : 'Start adding your menu items to showcase your offerings to customers.'}
              </p>
              <button
                onClick={() => handleOpenItemModal()}
                className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-secondary transition-colors"
              >
                Add Menu Item
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const category = categories?.find(c => c.id === item.categoryId);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 p-4 transition-all ${
                    item.available
                      ? 'border-gray-200 hover:border-brand-primary'
                      : 'border-gray-300 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                      {category && (
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                          {category.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-brand-primary font-bold text-xl">
                      <IndianRupee size={20} />
                      {item.price.toFixed(2)}
                    </div>

                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className="flex items-center gap-1 text-sm font-semibold"
                      title={item.available ? 'Mark as unavailable' : 'Mark as available'}
                    >
                      {item.available ? (
                        <>
                          <ToggleRight className="text-green-500" size={24} />
                          <span className="text-green-600">Available</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="text-gray-400" size={24} />
                          <span className="text-gray-500">Unavailable</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenItemModal(item)}
                      className="flex-1 py-2 px-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="py-2 px-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map(item => {
                  const category = categories?.find(c => c.id === item.categoryId);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {category && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg">
                            {category.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center font-bold text-brand-primary">
                          <IndianRupee size={16} />
                          {item.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className="flex items-center gap-1"
                        >
                          {item.available ? (
                            <>
                              <ToggleRight className="text-green-500" size={20} />
                              <span className="text-sm font-semibold text-green-600">Available</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="text-gray-400" size={20} />
                              <span className="text-sm font-semibold text-gray-500">Unavailable</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleOpenItemModal(item)}
                            className="p-2 text-brand-primary hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit item"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Menu Item Modal */}
      <Modal
        isOpen={showItemModal}
        onClose={handleCloseItemModal}
        title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <Input
            label="Item Name"
            type="text"
            placeholder="e.g., Veggie Burger"
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
            required
          />

          <div>
            <label className="text-sm font-semibold text-gray-700 ml-1 mb-1.5 block">Description (Optional)</label>
            <textarea
              placeholder="Describe your menu item..."
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white/50 backdrop-blur-sm resize-none"
            />
          </div>

          <Input
            label="Price (₹)"
            type="number"
            placeholder="0.00"
            value={itemForm.price}
            onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
            required
            min="0"
            step="0.01"
          />

          <div>
            <label className="text-sm font-semibold text-gray-700 ml-1 mb-1.5 block">Category</label>
            <select
              value={itemForm.categoryId}
              onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white/50 backdrop-blur-sm"
            >
              <option value="">No Category</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="available"
              checked={itemForm.available}
              onChange={(e) => setItemForm({ ...itemForm, available: e.target.checked })}
              className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <label htmlFor="available" className="ml-2 text-sm font-semibold text-gray-700">
              Available for ordering
            </label>
          </div>

          <button
            type="submit"
            disabled={itemMutation.isPending}
            className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {itemMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Saving...
              </>
            ) : editingItem ? (
              'Update Item'
            ) : (
              'Create Item'
            )}
          </button>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={handleCloseCategoryModal}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Category Name"
            type="text"
            placeholder="e.g., Burgers, Drinks, Desserts"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            required
          />

          <div>
            <label className="text-sm font-semibold text-gray-700 ml-1 mb-1.5 block">Description (Optional)</label>
            <textarea
              placeholder="Describe this category..."
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white/50 backdrop-blur-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={categoryMutation.isPending}
            className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {categoryMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Saving...
              </>
            ) : editingCategory ? (
              'Update Category'
            ) : (
              'Create Category'
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MenuManagement;
