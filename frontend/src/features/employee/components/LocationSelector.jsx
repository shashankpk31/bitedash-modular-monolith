import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Building2, Store, Utensils, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../common/components/Button';
import { ContentLoader } from '../../../common/components/Spinner';
import { useLocation } from '../../../contexts';
import {
  useLocations,
  useOffices,
  useCafeterias,
  useVendors,
} from '../../../services/queries/organization.queries';
import { useAuth } from '../../../contexts';

// Location Selector Component - 4-level hierarchy
// Why? Employees need to select: Location → Office → Cafeteria → Vendor
const LocationSelector = ({ onComplete, showVendorSelection = true }) => {
  const { user } = useAuth();
  const {
    selectedLocation,
    selectedOffice,
    selectedCafeteria,
    selectedVendor,
    setLocation,
    setOffice,
    setCafeteria,
    setVendor,
    clearLocation,
  } = useLocation();

  // Current selection step
  const [step, setStep] = useState(1);

  // Fetch data for each level
  const { data: locations, isLoading: locationsLoading } = useLocations(user?.organizationId);
  const { data: offices, isLoading: officesLoading } = useOffices(selectedLocation?.id);
  const { data: cafeterias, isLoading: cafeteriasLoading } = useCafeterias(selectedOffice?.id);
  const { data: vendors, isLoading: vendorsLoading } = useVendors(selectedCafeteria?.id);

  // Auto-advance to next step when selection is made
  useEffect(() => {
    if (selectedLocation && !selectedOffice && offices?.length > 0) {
      setStep(2);
    } else if (selectedOffice && !selectedCafeteria && cafeterias?.length > 0) {
      setStep(3);
    } else if (selectedCafeteria && !selectedVendor && vendors?.length > 0 && showVendorSelection) {
      setStep(4);
    }
  }, [selectedLocation, selectedOffice, selectedCafeteria, selectedVendor, offices, cafeterias, vendors, showVendorSelection]);

  // Handle selection at each level
  const handleLocationSelect = (location) => {
    setLocation(location);
  };

  const handleOfficeSelect = (office) => {
    setOffice(office);
  };

  const handleCafeteriaSelect = (cafeteria) => {
    setCafeteria(cafeteria);
  };

  const handleVendorSelect = (vendor) => {
    setVendor(vendor);
    if (onComplete) {
      onComplete({ location: selectedLocation, office: selectedOffice, cafeteria: selectedCafeteria, vendor });
    }
  };

  // Handle completion without vendor selection
  const handleComplete = () => {
    if (onComplete) {
      onComplete({ location: selectedLocation, office: selectedOffice, cafeteria: selectedCafeteria, vendor: selectedVendor });
    }
  };

  // Selection step component
  const SelectionStep = ({ title, icon: Icon, items, isLoading, onSelect, selectedItem, emptyMessage }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-headline text-headline-sm text-on-surface">{title}</h3>
          <p className="text-label-sm text-on-surface-variant">Select from available options</p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && <ContentLoader message="Loading options..." />}

      {/* Empty state */}
      {!isLoading && items?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-body-md text-on-surface-variant">{emptyMessage}</p>
        </div>
      )}

      {/* Items list */}
      {!isLoading && items?.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {items.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className={`p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant hover:border-outline hover:bg-surface-container-low'
                }`}
              >
                <div>
                  <div className="font-headline text-body-lg text-on-surface">
                    {item.name}
                  </div>
                  {item.description && (
                    <div className="text-label-sm text-on-surface-variant mt-1">
                      {item.description}
                    </div>
                  )}
                  {item.address && (
                    <div className="text-label-sm text-on-surface-variant mt-1">
                      {item.address}
                    </div>
                  )}
                </div>
                <ChevronRight size={20} className={isSelected ? 'text-primary' : 'text-on-surface-variant'} />
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb - shows current selection path */}
      {(selectedLocation || selectedOffice || selectedCafeteria || selectedVendor) && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedLocation && (
            <>
              <Button variant="ghost" size="sm" onClick={() => { setStep(1); setLocation(null); }}>
                {selectedLocation.name}
              </Button>
              {selectedOffice && <ChevronRight size={16} className="text-on-surface-variant" />}
            </>
          )}
          {selectedOffice && (
            <>
              <Button variant="ghost" size="sm" onClick={() => { setStep(2); setOffice(null); }}>
                {selectedOffice.name}
              </Button>
              {selectedCafeteria && <ChevronRight size={16} className="text-on-surface-variant" />}
            </>
          )}
          {selectedCafeteria && (
            <>
              <Button variant="ghost" size="sm" onClick={() => { setStep(3); setCafeteria(null); }}>
                {selectedCafeteria.name}
              </Button>
              {selectedVendor && showVendorSelection && <ChevronRight size={16} className="text-on-surface-variant" />}
            </>
          )}
          {selectedVendor && showVendorSelection && (
            <Button variant="ghost" size="sm">
              {selectedVendor.name}
            </Button>
          )}
          <button
            onClick={clearLocation}
            className="ml-auto p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <X size={16} className="text-on-surface-variant" />
          </button>
        </div>
      )}

      {/* Selection steps */}
      <AnimatePresence mode="wait">
        {/* Step 1: Location */}
        {step === 1 && (
          <SelectionStep
            key="location"
            title="Select Location"
            icon={MapPin}
            items={locations}
            isLoading={locationsLoading}
            onSelect={handleLocationSelect}
            selectedItem={selectedLocation}
            emptyMessage="No locations available"
          />
        )}

        {/* Step 2: Office */}
        {step === 2 && selectedLocation && (
          <SelectionStep
            key="office"
            title="Select Office"
            icon={Building2}
            items={offices}
            isLoading={officesLoading}
            onSelect={handleOfficeSelect}
            selectedItem={selectedOffice}
            emptyMessage="No offices available at this location"
          />
        )}

        {/* Step 3: Cafeteria */}
        {step === 3 && selectedOffice && (
          <SelectionStep
            key="cafeteria"
            title="Select Cafeteria"
            icon={Store}
            items={cafeterias}
            isLoading={cafeteriasLoading}
            onSelect={handleCafeteriaSelect}
            selectedItem={selectedCafeteria}
            emptyMessage="No cafeterias available at this office"
          />
        )}

        {/* Step 4: Vendor (optional) */}
        {step === 4 && selectedCafeteria && showVendorSelection && (
          <SelectionStep
            key="vendor"
            title="Select Vendor"
            icon={Utensils}
            items={vendors}
            isLoading={vendorsLoading}
            onSelect={handleVendorSelect}
            selectedItem={selectedVendor}
            emptyMessage="No vendors available at this cafeteria"
          />
        )}
      </AnimatePresence>

      {/* Complete button (if vendor selection is optional) */}
      {selectedCafeteria && !showVendorSelection && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleComplete}
        >
          Continue
        </Button>
      )}
    </div>
  );
};

LocationSelector.propTypes = {
  onComplete: PropTypes.func,
  showVendorSelection: PropTypes.bool,
};

export default LocationSelector;
