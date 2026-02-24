import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const LocationContext = createContext(null);

const STORAGE_KEY = 'bitedash_location_prefs';

export const LocationProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    organizationId: null,
    organizationName: null,
    officeId: null,
    officeName: null,
    cafeteriaId: null,
    cafeteriaName: null,
    isConfigured: false,
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
      }
    } catch (error) {
      console.error('Failed to load location preferences:', error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (preferences.isConfigured) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.error('Failed to save location preferences:', error);
      }
    }
  }, [preferences]);

  const setLocation = (newPreferences) => {
    setPreferences({
      ...newPreferences,
      isConfigured: true,
    });
  };

  const clearLocation = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPreferences({
      organizationId: null,
      organizationName: null,
      officeId: null,
      officeName: null,
      cafeteriaId: null,
      cafeteriaName: null,
      isConfigured: false,
    });
  };

  const updateCafeteria = (cafeteriaId, cafeteriaName) => {
    setPreferences(prev => ({
      ...prev,
      cafeteriaId,
      cafeteriaName,
    }));
  };

  const value = useMemo(
    () => ({
      preferences,
      setLocation,
      clearLocation,
      updateCafeteria,
      isConfigured: preferences.isConfigured,
      cafeteriaId: preferences.cafeteriaId,
      cafeteriaName: preferences.cafeteriaName,
      officeId: preferences.officeId,
      officeName: preferences.officeName,
      organizationId: preferences.organizationId,
      organizationName: preferences.organizationName,
    }),
    [preferences]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};
