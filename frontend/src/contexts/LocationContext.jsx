import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { LOCL_STRG_KEY } from '../config/constants';

// Why use Context? Location selection affects menu display across the app
const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  // Location hierarchy: Location → Office → Cafeteria → Vendor
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedCafeteria, setSelectedCafeteria] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Load location from localStorage on mount
  // Why? Remember user's last selection
  useEffect(() => {
    try {
      const storedLocation = localStorage.getItem(LOCL_STRG_KEY.LOCATION);
      if (storedLocation) {
        const { location, office, cafeteria, vendor } = JSON.parse(storedLocation);
        setSelectedLocation(location);
        setSelectedOffice(office);
        setSelectedCafeteria(cafeteria);
        setSelectedVendor(vendor);
      }
    } catch (error) {
      console.error('Failed to load location:', error);
      localStorage.removeItem(LOCL_STRG_KEY.LOCATION);
    }
  }, []);

  // Save location to localStorage whenever it changes
  // Why? Automatic persistence
  useEffect(() => {
    if (selectedLocation || selectedOffice || selectedCafeteria || selectedVendor) {
      localStorage.setItem(
        LOCL_STRG_KEY.LOCATION,
        JSON.stringify({
          location: selectedLocation,
          office: selectedOffice,
          cafeteria: selectedCafeteria,
          vendor: selectedVendor,
        })
      );
    } else {
      localStorage.removeItem(LOCL_STRG_KEY.LOCATION);
    }
  }, [selectedLocation, selectedOffice, selectedCafeteria, selectedVendor]);

  // Set location and clear downstream selections
  // Why? Cascade reset ensures data consistency
  const setLocation = useCallback((location) => {
    setSelectedLocation(location);
    setSelectedOffice(null);
    setSelectedCafeteria(null);
    setSelectedVendor(null);
  }, []);

  // Set office and clear downstream selections
  const setOffice = useCallback((office) => {
    setSelectedOffice(office);
    setSelectedCafeteria(null);
    setSelectedVendor(null);
  }, []);

  // Set cafeteria and clear downstream selections
  const setCafeteria = useCallback((cafeteria) => {
    setSelectedCafeteria(cafeteria);
    setSelectedVendor(null);
  }, []);

  // Set vendor (leaf node, no cascade)
  const setVendor = useCallback((vendor) => {
    setSelectedVendor(vendor);
  }, []);

  // Clear all selections
  const clearLocation = useCallback(() => {
    setSelectedLocation(null);
    setSelectedOffice(null);
    setSelectedCafeteria(null);
    setSelectedVendor(null);
    localStorage.removeItem(LOCL_STRG_KEY.LOCATION);
  }, []);

  // Check if location is fully selected (all levels chosen)
  const isLocationComplete = useMemo(() => {
    return !!(selectedLocation && selectedOffice && selectedCafeteria);
  }, [selectedLocation, selectedOffice, selectedCafeteria]);

  // Check if ready to browse menus (location + vendor selected)
  const isReadyForMenu = useMemo(() => {
    return isLocationComplete && !!selectedVendor;
  }, [isLocationComplete, selectedVendor]);

  // Get location breadcrumb string for display
  const getLocationBreadcrumb = useMemo(() => {
    const parts = [];
    if (selectedLocation?.name) parts.push(selectedLocation.name);
    if (selectedOffice?.name) parts.push(selectedOffice.name);
    if (selectedCafeteria?.name) parts.push(selectedCafeteria.name);
    return parts.join(' → ');
  }, [selectedLocation, selectedOffice, selectedCafeteria]);

  // Memoize context value
  const value = useMemo(
    () => ({
      // State
      selectedLocation,
      selectedOffice,
      selectedCafeteria,
      selectedVendor,

      // Computed
      isLocationComplete,
      isReadyForMenu,
      locationBreadcrumb: getLocationBreadcrumb,

      // Actions
      setLocation,
      setOffice,
      setCafeteria,
      setVendor,
      clearLocation,
    }),
    [
      selectedLocation,
      selectedOffice,
      selectedCafeteria,
      selectedVendor,
      isLocationComplete,
      isReadyForMenu,
      getLocationBreadcrumb,
      setLocation,
      setOffice,
      setCafeteria,
      setVendor,
      clearLocation,
    ]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

LocationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use location context
export const useLocation = () => {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }

  return context;
};

export default LocationContext;
