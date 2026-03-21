import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Grid3x3, List, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';
import Badge from '../../../common/components/Badge';
import { ContentLoader, PageLoader } from '../../../common/components/Spinner';
import MenuItemCard from '../components/MenuItemCard';
import { useVendor, useVendorMenu, useMenuCategories } from '../../../services/queries';
import { useCart } from '../../../contexts';
import { debounce } from '../../../common/utils';

// Vendor Detail Page - Full menu for selected vendor
// Why? Main menu browsing experience with search, filters, and cart
const VendorDetailPage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { cartTotals } = useCart();

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Fetch vendor details and menu
  const { data: vendor, isLoading: vendorLoading } = useVendor(vendorId);
  const { data: menuItems, isLoading: menuLoading } = useVendorMenu(vendorId);
  const { data: categories } = useMenuCategories();

  // Debounced search to avoid excessive filtering
  const debouncedSearch = useMemo(
    () => debounce((query) => setSearchQuery(query), 300),
    []
  );

  // Filter and search menu items
  const filteredItems = useMemo(() => {
    if (!menuItems) return [];

    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.categoryId === parseInt(selectedCategory));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [menuItems, selectedCategory, searchQuery]);

  // Group items by category for display
  const itemsByCategory = useMemo(() => {
    if (!filteredItems || selectedCategory !== 'all') return null;

    const grouped = {};
    filteredItems.forEach(item => {
      const categoryId = item.categoryId || 'other';
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(item);
    });
    return grouped;
  }, [filteredItems, selectedCategory]);

  // Loading state
  if (vendorLoading) {
    return <PageLoader message="Loading vendor..." />;
  }

  // Error state - vendor not found
  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="font-headline text-headline-lg text-on-surface">Vendor Not Found</h2>
          <p className="text-body-md text-on-surface-variant">
            The vendor you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="primary" onClick={() => navigate('/employee/menu')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-20">
      {/* Header with vendor info */}
      <div className="sticky top-0 z-30 bg-surface-container-low">
        {/* Back button and actions */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/15">
          <button
            onClick={() => navigate('/employee/menu')}
            className="p-2 -ml-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <ArrowLeft size={20} className="text-on-surface" />
          </button>

          {/* View mode toggle */}
          <div className="flex items-center gap-2 p-1 bg-surface-container rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Grid3x3 size={16} />
            </button>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-4">
            {/* Vendor logo */}
            <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-surface-container overflow-hidden">
              {vendor.logoUrl && (
                <img
                  src={vendor.logoUrl}
                  alt={vendor.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Vendor details */}
            <div className="flex-1 min-w-0">
              <h1 className="font-headline text-headline-lg text-on-surface">
                {vendor.name}
              </h1>
              {vendor.description && (
                <p className="text-body-sm text-on-surface-variant mt-1">
                  {vendor.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-label-sm text-on-surface-variant">
                {vendor.cuisineType && <span>{vendor.cuisineType}</span>}
                {vendor.rating && <span>⭐ {vendor.rating.toFixed(1)}</span>}
                {vendor.prepTime && <span>~{vendor.prepTime} min</span>}
              </div>
            </div>
          </div>

          {/* Search */}
          <Input
            type="search"
            placeholder="Search menu items..."
            onChange={(e) => debouncedSearch(e.target.value)}
            icon={<Search size={18} />}
            iconPosition="left"
          />

          {/* Category filters */}
          <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
            <div className="flex gap-2" style={{ width: 'max-content' }}>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-label-md font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                All Items
              </button>
              {categories?.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id.toString())}
                  className={`px-4 py-2 rounded-full text-label-md font-semibold transition-colors whitespace-nowrap ${
                    selectedCategory === category.id.toString()
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4">
        {/* Loading */}
        {menuLoading && <ContentLoader message="Loading menu..." />}

        {/* Empty state */}
        {!menuLoading && filteredItems.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <h3 className="font-headline text-headline-sm text-on-surface">No Items Found</h3>
            <p className="text-body-md text-on-surface-variant">
              {searchQuery
                ? 'Try a different search term'
                : 'No items available in this category'}
            </p>
          </div>
        )}

        {/* Items display */}
        {!menuLoading && filteredItems.length > 0 && (
          <div className="space-y-8">
            {/* Category grouping (only when showing all) */}
            {selectedCategory === 'all' && itemsByCategory ? (
              Object.entries(itemsByCategory).map(([categoryId, items]) => {
                const category = categories?.find(c => c.id === parseInt(categoryId));
                return (
                  <section key={categoryId} className="space-y-3">
                    <h2 className="font-headline text-headline-md text-on-surface">
                      {category?.name || 'Other'}
                    </h2>
                    <div className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-2 gap-3'
                        : 'space-y-3'
                    }>
                      {items.map(item => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          variant={viewMode}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            ) : (
              // Simple list when filtered by category
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 gap-3'
                  : 'space-y-3'
              }>
                {filteredItems.map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    variant={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartTotals.itemCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-30"
          >
            <button
              onClick={() => navigate('/employee/cart')}
              className="w-full glass-dark rounded-xl p-4 shadow-ambient-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <ShoppingCart size={20} className="text-on-primary" />
                </div>
                <div className="text-left">
                  <div className="text-label-md text-surface font-semibold">
                    {cartTotals.itemCount} item{cartTotals.itemCount !== 1 ? 's' : ''}
                  </div>
                  <div className="text-label-sm text-surface/80">
                    ₹{cartTotals.total.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-label-md text-surface font-semibold">
                View Cart →
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorDetailPage;
