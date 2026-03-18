import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import Card from '../../../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import vendorService from '../services/vendorService';
import MenuItemModal from '../components/MenuItemModal';
import { foodPlaceholder } from '../../../utils/placeholders';

const MenuManagementPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menu-items', user?.id],
    queryFn: () => vendorService.getMyMenuItems(user.id),
    enabled: !!user?.id,
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, available }) => vendorService.updateMenuItem(id, { available }),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Availability updated');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => vendorService.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Item deleted');
    },
  });

  const categories = ['All Items', 'Appetizers', 'Main Course', 'Beverages', 'Desserts'];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Items' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-6">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Menu Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your food items, pricing, and live availability.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            icon={<Icon name="add" />}
          >
            Add New Item
          </Button>
        </div>
      </header>

      {/* Search */}
      <div className="px-6 py-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          placeholder="Search menu items..."
        />
      </div>

      {/* Category Tabs */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat} ({menuItems.filter(i => cat === 'All Items' || i.category === cat).length})
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="px-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card padding="lg" className="text-center">
            <Icon name="restaurant_menu" size={48} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No items found</p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Add Your First Item
            </Button>
          </Card>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    In Stock
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {filteredItems.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl || foodPlaceholder}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => { e.target.src = foodPlaceholder; }}
                          />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info" size="sm">{item.category}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">${item.price.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleAvailabilityMutation.mutate({ id: item.id, available: !item.available })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            item.available ? 'bg-success' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              item.available ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <Icon name="edit" size={18} className="text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <Icon name="delete" size={18} className="text-error" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredItems.length} of {menuItems.length} items
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50">
                  Previous
                </button>
                <button className="px-3 py-1 rounded-lg bg-primary text-white font-semibold">1</button>
                <button className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">2</button>
                <button className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <MenuItemModal
          item={editingItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

export default MenuManagementPage;
