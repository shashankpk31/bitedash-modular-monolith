// Organization, Location, Cafeteria, Vendor Query Hooks
// Why TanStack Query? Provides caching, background refetching, and optimistic updates

import { useQuery } from '@tanstack/react-query';
import {
  getOrganizations,
  getOrganizationById,
  getLocationsByOrganization,
  getLocationById,
  getOfficesByLocation,
  getOfficeById,
  getCafeteriasByOffice,
  getCafeteriaById,
  getVendorsByCafeteria,
  getVendorById,
  getVendorStats,
} from '../api/organization.api';
import { QUERY_KEYS } from '../../config/constants';

/**
 * Hook to get all organizations
 * Why? Employee/vendor registration needs organization list
 */
export const useOrganizations = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATIONS,
    queryFn: getOrganizations,
    // Cache for 10 minutes - organizations don't change frequently
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook to get organization by ID
 */
export const useOrganization = (organizationId) => {
  return useQuery({
    queryKey: QUERY_KEYS.ORGANIZATION_BY_ID(organizationId),
    queryFn: () => getOrganizationById(organizationId),
    // Only fetch if organizationId is provided
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook to get locations for an organization
 * Why? First step in location selection hierarchy
 */
export const useLocations = (organizationId) => {
  return useQuery({
    queryKey: QUERY_KEYS.LOCATIONS,
    queryFn: () => getLocationsByOrganization(organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get location by ID
 */
export const useLocation = (locationId) => {
  return useQuery({
    queryKey: QUERY_KEYS.LOCATION_BY_ID(locationId),
    queryFn: () => getLocationById(locationId),
    enabled: !!locationId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get offices for a location
 * Why? Second step in location hierarchy
 */
export const useOffices = (locationId) => {
  return useQuery({
    queryKey: ['offices', locationId],
    queryFn: () => getOfficesByLocation(locationId),
    enabled: !!locationId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get office by ID
 */
export const useOffice = (officeId) => {
  return useQuery({
    queryKey: ['office', officeId],
    queryFn: () => getOfficeById(officeId),
    enabled: !!officeId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get cafeterias for an office
 * Why? Third step in location hierarchy
 */
export const useCafeterias = (officeId) => {
  return useQuery({
    queryKey: QUERY_KEYS.CAFETERIAS(officeId),
    queryFn: () => getCafeteriasByOffice(officeId),
    enabled: !!officeId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get cafeteria by ID
 */
export const useCafeteria = (cafeteriaId) => {
  return useQuery({
    queryKey: ['cafeteria', cafeteriaId],
    queryFn: () => getCafeteriaById(cafeteriaId),
    enabled: !!cafeteriaId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get vendors for a cafeteria
 * Why? Final step in location hierarchy - shows available vendors
 */
export const useVendors = (cafeteriaId) => {
  return useQuery({
    queryKey: QUERY_KEYS.VENDORS(cafeteriaId),
    queryFn: () => getVendorsByCafeteria(cafeteriaId),
    enabled: !!cafeteriaId,
    // Refetch more frequently - vendor availability changes
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook to get vendor details
 * Why? Shows vendor info and menu items
 */
export const useVendor = (vendorId) => {
  return useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => getVendorById(vendorId),
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook to get vendor statistics (admin only)
 */
export const useVendorStats = (vendorId) => {
  return useQuery({
    queryKey: ['vendorStats', vendorId],
    queryFn: () => getVendorStats(vendorId),
    enabled: !!vendorId,
    // Stats update less frequently
    staleTime: 1000 * 60 * 5,
  });
};
