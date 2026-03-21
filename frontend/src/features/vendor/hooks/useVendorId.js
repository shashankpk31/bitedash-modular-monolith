import { useQuery } from '@tanstack/react-query';
import { getMyVendor } from '../../../services/api/organization.api';
import { QUERY_KEYS } from '../../../config/constants';

/**
 * Custom hook to get the current vendor's ID
 * Uses the my-vendor endpoint to fetch vendor profile and extract ID
 * @returns {Object} { vendorId, isLoading, error }
 */
export const useVendorId = () => {
  const { data: vendor, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.VENDORS, 'my-vendor'],
    queryFn: getMyVendor,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    vendorId: vendor?.id || null,
    vendor,
    isLoading,
    error,
  };
};
