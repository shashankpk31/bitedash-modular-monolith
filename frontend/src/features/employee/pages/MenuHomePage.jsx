import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../../common/components/Button';
import Modal from '../../../common/components/Modal';
import { ContentLoader } from '../../../common/components/Spinner';
import LocationSelector from '../components/LocationSelector';
import { useLocation, useCart } from '../../../contexts';
import { useVendors, usePromotedItems } from '../../../services/queries';

// Menu Home Page - Main employee dashboard for ordering
// Why? Starting point for food ordering with location and vendor selection
const MenuHomePage = () => {
  const navigate = useNavigate();
  const {
    selectedLocation,
    selectedOffice,
    selectedCafeteria,
    selectedVendor,
    isLocationComplete,
    locationBreadcrumb,
  } = useLocation();

  const { setLocation: setCartLocation } = useCart();

  const [showLocationModal, setShowLocationModal] = useState(!isLocationComplete);

  // Update cart location context whenever location changes
  useEffect(() => {
    if (selectedCafeteria && selectedOffice && selectedLocation) {
      setCartLocation(selectedCafeteria.id, selectedOffice.id, selectedLocation.id);
    }
  }, [selectedCafeteria, selectedOffice, selectedLocation, setCartLocation]);

  // Fetch vendors for selected cafeteria
  const { data: vendors, isLoading: vendorsLoading } = useVendors(selectedCafeteria?.id);

  // Fetch promoted items (optional - for featured section)
  const { data: promotedItems } = usePromotedItems();

  // Handle location selection complete
  const handleLocationComplete = () => {
    setShowLocationModal(false);
  };

  // Navigate to vendor detail page
  const handleVendorClick = (vendor) => {
    navigate(`/employee/vendor/${vendor.id}`);
  };

  // Show location selector if location not complete
  if (!isLocationComplete) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-headline text-display-sm text-on-surface">
            Select Your Location
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Choose your location to see available vendors
          </p>
        </div>

        <LocationSelector
          onComplete={handleLocationComplete}
          showVendorSelection={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header Section */}
      <div className="bg-surface-container-low p-4 space-y-4">
        {/* Location Display */}
        <button
          onClick={() => setShowLocationModal(true)}
          className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:shadow-card transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin size={20} className="text-primary" />
            </div>
            <div className="text-left">
              <div className="text-label-sm text-on-surface-variant">Ordering from</div>
              <div className="font-headline text-body-md text-on-surface">
                {locationBreadcrumb || 'Select location'}
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-on-surface-variant" />
        </button>

        {/* Welcome Message */}
        <div className="space-y-2">
          <h1 className="font-headline text-display-sm text-on-surface">
            What are you craving today?
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Order from your favorite vendors
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Promoted/Featured Items Section (Optional) */}
        {promotedItems && promotedItems.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-headline text-headline-md text-on-surface">
              Featured Today
            </h2>
            <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
              <div className="flex gap-3" style={{ width: 'max-content' }}>
                {promotedItems.slice(0, 5).map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    className="w-48 bg-surface-container-lowest rounded-xl overflow-hidden shadow-card"
                  >
                    <div className="aspect-square bg-surface-container">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-headline text-body-md text-on-surface line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-label-sm text-primary font-semibold mt-1">
                        ₹{item.price}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Vendors List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-headline-md text-on-surface">
              Available Vendors
            </h2>
            {vendors && vendors.length > 0 && (
              <span className="text-label-md text-on-surface-variant">
                {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Loading State */}
          {vendorsLoading && (
            <ContentLoader message="Loading vendors..." />
          )}

          {/* Empty State */}
          {!vendorsLoading && (!vendors || vendors.length === 0) && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container flex items-center justify-center">
                <AlertCircle size={32} className="text-on-surface-variant" />
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-headline-sm text-on-surface">
                  No Vendors Available
                </h3>
                <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
                  There are no vendors available at this location right now. Please try a different location.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowLocationModal(true)}
              >
                Change Location
              </Button>
            </div>
          )}

          {/* Vendors Grid */}
          {!vendorsLoading && vendors && vendors.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {vendors.map((vendor) => (
                <motion.button
                  key={vendor.id}
                  onClick={() => handleVendorClick(vendor)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-surface-container-lowest rounded-xl p-4 shadow-card hover:shadow-ambient transition-all text-left"
                >
                  <div className="flex items-start gap-4">
                    {/* Vendor Image/Logo */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-surface-container overflow-hidden">
                      {vendor.logoUrl ? (
                        <img
                          src={vendor.logoUrl}
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store size={32} className="text-on-surface-variant opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Vendor Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline text-headline-sm text-on-surface mb-1">
                        {vendor.name}
                      </h3>
                      {vendor.description && (
                        <p className="text-label-md text-on-surface-variant line-clamp-2 mb-2">
                          {vendor.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
                        {vendor.cuisineType && (
                          <span>{vendor.cuisineType}</span>
                        )}
                        {vendor.rating && (
                          <span className="flex items-center gap-1">
                            ⭐ {vendor.rating.toFixed(1)}
                          </span>
                        )}
                        {vendor.prepTime && (
                          <span>~{vendor.prepTime} min</span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight size={20} className="text-on-surface-variant flex-shrink-0 mt-2" />
                  </div>

                  {/* Status Badge */}
                  {vendor.isOpen === false && (
                    <div className="mt-3 px-3 py-1 bg-error/10 rounded-lg inline-block">
                      <span className="text-label-sm text-error font-semibold">Closed</span>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Location Selector Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title="Change Location"
        size="lg"
      >
        <LocationSelector
          onComplete={handleLocationComplete}
          showVendorSelection={false}
        />
      </Modal>
    </div>
  );
};

export default MenuHomePage;
