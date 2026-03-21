import { useState } from 'react';
import { Package, AlertTriangle, TrendingDown, Search, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';
import Badge from '../../../common/components/Badge';
import Modal from '../../../common/components/Modal';
import { ContentLoader } from '../../../common/components/Spinner';
import { useVendorMenu } from '../../../services/queries/menu.queries';
import { useAuth } from '../../../contexts';
import { useVendorId } from '../hooks/useVendorId';

// Inventory Management Page - Track stock levels and availability
// Why? Vendors need to manage item availability based on stock
const InventoryManagementPage = () => {
  const { user } = useAuth();

  // Get vendor ID from backend
  const { vendorId, isLoading: vendorIdLoading } = useVendorId();

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch menu items (using same query as menu management)
  // In real implementation, this should fetch inventory-specific data
  const { data: menuItems, isLoading: menuLoading } = useVendorMenu(vendorId);

  const isLoading = vendorIdLoading || menuLoading;

  // Mock inventory data - TODO: Replace with actual inventory API
  // Each menu item should have: currentStock, lowStockThreshold, unit
  const inventoryItems = menuItems?.map(item => ({
    ...item,
    currentStock: Math.floor(Math.random() * 100),
    lowStockThreshold: 10,
    unit: 'portions',
  })) || [];

  // Filter items
  const filteredItems = inventoryItems.filter(item => {
    // Search filter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Stock filter
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = item.currentStock > 0 && item.currentStock <= item.lowStockThreshold;
    } else if (stockFilter === 'out') {
      matchesStock = item.currentStock === 0;
    }

    return matchesSearch && matchesStock;
  });

  // Stock status helpers
  const getStockStatus = (item) => {
    if (item.currentStock === 0) return { label: 'Out of Stock', variant: 'error' };
    if (item.currentStock <= item.lowStockThreshold) return { label: 'Low Stock', variant: 'warning' };
    return { label: 'In Stock', variant: 'success' };
  };

  const getStockColor = (item) => {
    if (item.currentStock === 0) return 'text-error';
    if (item.currentStock <= item.lowStockThreshold) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Stats
  const stats = {
    totalItems: inventoryItems.length,
    lowStock: inventoryItems.filter(i => i.currentStock > 0 && i.currentStock <= i.lowStockThreshold).length,
    outOfStock: inventoryItems.filter(i => i.currentStock === 0).length,
    inStock: inventoryItems.filter(i => i.currentStock > i.lowStockThreshold).length,
  };

  // Handle update stock
  const handleUpdateStock = (item) => {
    setSelectedItem(item);
    setShowUpdateModal(true);
  };

  // Update Stock Modal Component
  const UpdateStockModal = ({ item, onClose }) => {
    const [stockData, setStockData] = useState({
      currentStock: item?.currentStock || 0,
      lowStockThreshold: item?.lowStockThreshold || 10,
      addStock: 0,
      removeStock: 0,
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // TODO: Implement update stock API call
      const newStock = stockData.currentStock + stockData.addStock - stockData.removeStock;
      console.log('Updating stock for:', item.name, 'New stock:', newStock);
      onClose();
    };

    const newStock = stockData.currentStock + stockData.addStock - stockData.removeStock;

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Stock */}
        <div className="bg-surface-container rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label-sm text-on-surface-variant">Current Stock</p>
              <p className={`font-headline text-headline-lg ${getStockColor(item)}`}>
                {stockData.currentStock} {item.unit}
              </p>
            </div>
            <Package size={32} className="text-on-surface-variant opacity-20" />
          </div>
        </div>

        {/* Add Stock */}
        <Input
          label="Add Stock"
          type="number"
          min="0"
          value={stockData.addStock}
          onChange={(e) => setStockData({ ...stockData, addStock: parseInt(e.target.value) || 0 })}
          placeholder="0"
          helperText="Increase stock quantity"
        />

        {/* Remove Stock */}
        <Input
          label="Remove Stock (Wastage/Damage)"
          type="number"
          min="0"
          max={stockData.currentStock}
          value={stockData.removeStock}
          onChange={(e) => setStockData({ ...stockData, removeStock: parseInt(e.target.value) || 0 })}
          placeholder="0"
          helperText="Decrease stock quantity"
        />

        {/* Low Stock Threshold */}
        <Input
          label="Low Stock Alert Threshold"
          type="number"
          min="0"
          value={stockData.lowStockThreshold}
          onChange={(e) => setStockData({ ...stockData, lowStockThreshold: parseInt(e.target.value) || 0 })}
          placeholder="10"
          helperText="Alert when stock falls below this level"
        />

        {/* Preview */}
        {(stockData.addStock > 0 || stockData.removeStock > 0) && (
          <div className="bg-primary/10 rounded-xl p-4">
            <p className="text-label-sm text-on-surface-variant mb-1">New Stock Level</p>
            <p className="font-headline text-headline-md text-primary">
              {newStock} {item.unit}
            </p>
            {stockData.addStock > 0 && (
              <p className="text-label-sm text-green-600 mt-1">
                +{stockData.addStock} {item.unit} added
              </p>
            )}
            {stockData.removeStock > 0 && (
              <p className="text-label-sm text-error mt-1">
                -{stockData.removeStock} {item.unit} removed
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={stockData.addStock === 0 && stockData.removeStock === 0}
          >
            Update Stock
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
            <h1 className="font-headline text-display-sm text-on-surface">Inventory Management</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Track stock levels and manage availability
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="bg-surface-container-lowest rounded-xl p-4">
            <div className="flex items-center gap-2 text-on-surface-variant mb-1">
              <Package size={16} />
              <span className="text-label-sm uppercase">Total Items</span>
            </div>
            <div className="font-headline text-headline-lg text-on-surface">{stats.totalItems}</div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Package size={16} />
              <span className="text-label-sm uppercase">In Stock</span>
            </div>
            <div className="font-headline text-headline-lg text-green-600">{stats.inStock}</div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <AlertTriangle size={16} />
              <span className="text-label-sm uppercase">Low Stock</span>
            </div>
            <div className="font-headline text-headline-lg text-yellow-600">{stats.lowStock}</div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4">
            <div className="flex items-center gap-2 text-error mb-1">
              <TrendingDown size={16} />
              <span className="text-label-sm uppercase">Out of Stock</span>
            </div>
            <div className="font-headline text-headline-lg text-error">{stats.outOfStock}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 mt-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={18} />}
              iconPosition="left"
            />
          </div>

          {/* Stock Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Items' },
              { value: 'low', label: 'Low Stock' },
              { value: 'out', label: 'Out of Stock' },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setStockFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-label-md font-semibold transition-colors ${
                  stockFilter === filter.value
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

      {/* Inventory List */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Loading */}
        {isLoading && <ContentLoader message="Loading inventory..." />}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-container flex items-center justify-center">
              <Package size={40} className="text-on-surface-variant opacity-40" />
            </div>
            <div className="space-y-2">
              <h3 className="font-headline text-headline-sm text-on-surface">
                {searchQuery || stockFilter !== 'all' ? 'No Items Found' : 'No Inventory Items'}
              </h3>
              <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
                {searchQuery
                  ? 'Try a different search term'
                  : stockFilter !== 'all'
                  ? `No items with ${stockFilter === 'low' ? 'low stock' : 'out of stock'} status`
                  : 'Add menu items to start tracking inventory'}
              </p>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="space-y-3">
            {filteredItems.map(item => {
              const status = getStockStatus(item);

              return (
                <motion.div
                  key={item.id}
                  layout
                  className="bg-surface-container-lowest rounded-xl p-4 shadow-card hover:shadow-ambient transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-surface-container overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-on-surface-variant opacity-20" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-headline text-body-lg text-on-surface line-clamp-1">
                            {item.name}
                          </h3>
                          <p className="text-label-sm text-on-surface-variant mt-1">
                            {item.category || 'Uncategorized'}
                          </p>
                        </div>
                        <Badge variant={status.variant} size="sm">
                          {status.label}
                        </Badge>
                      </div>

                      {/* Stock Info */}
                      <div className="flex items-center gap-6 mb-3">
                        <div>
                          <p className="text-label-sm text-on-surface-variant">Current Stock</p>
                          <p className={`font-headline text-body-lg ${getStockColor(item)}`}>
                            {item.currentStock} {item.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-label-sm text-on-surface-variant">Alert Threshold</p>
                          <p className="font-headline text-body-lg text-on-surface">
                            {item.lowStockThreshold} {item.unit}
                          </p>
                        </div>
                        {item.currentStock <= item.lowStockThreshold && item.currentStock > 0 && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle size={14} />
                            <span className="text-label-sm font-semibold">Restock Soon</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit size={16} />}
                          onClick={() => handleUpdateStock(item)}
                        >
                          Update Stock
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Update Stock Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedItem(null);
        }}
        title={`Update Stock - ${selectedItem?.name}`}
        size="md"
      >
        {selectedItem && (
          <UpdateStockModal
            item={selectedItem}
            onClose={() => {
              setShowUpdateModal(false);
              setSelectedItem(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default InventoryManagementPage;
