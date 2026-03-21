// Menu Query Hooks
// Why? Provides React integration for menu browsing with caching

import { useQuery } from '@tanstack/react-query';
import {
  getMenuItems,
  getMenuItemsByVendor,
  getMenuItemById,
  getPromotedMenuItems,
  getMenuCategories,
  searchMenuItems,
  getMenuItemAvailability,
} from '../api/menu.api';
import { QUERY_KEYS } from '../../config/constants';

/**
 * Hook to get all menu items with filters
 * Why? Browse menu across vendors
 */
export const useMenuItems = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.MENUS, params],
    queryFn: () => getMenuItems(params),
    // Menus change frequently - shorter cache time
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook to get menu items for a specific vendor
 * Why? Most common use case - browsing single vendor's menu
 */
export const useVendorMenu = (vendorId) => {
  return useQuery({
    queryKey: QUERY_KEYS.MENU_BY_VENDOR(vendorId),
    queryFn: () => getMenuItemsByVendor(vendorId),
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook to get single menu item details
 * Why? Item detail page with full description, images, etc.
 */
export const useMenuItem = (itemId) => {
  return useQuery({
    queryKey: QUERY_KEYS.MENU_BY_ID(itemId),
    queryFn: () => getMenuItemById(itemId),
    enabled: !!itemId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get promoted/featured items
 * Why? Homepage highlights and recommendations
 */
export const usePromotedItems = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MENU_PROMOTED,
    queryFn: getPromotedMenuItems,
    // Promoted items change daily
    staleTime: 1000 * 60 * 30,
  });
};

/**
 * Hook to get menu categories
 * Why? Category filters in menu browsing
 */
export const useMenuCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MENU_CATEGORIES,
    queryFn: getMenuCategories,
    // Categories rarely change
    staleTime: 1000 * 60 * 60,
  });
};

/**
 * Hook to search menu items
 * Why? Search functionality across menu
 * Note: Disabled by default, enabled when query is provided
 */
export const useMenuSearch = (query, filters = {}) => {
  return useQuery({
    queryKey: ['menuSearch', query, filters],
    queryFn: () => searchMenuItems(query, filters),
    // Only search when query has at least 2 characters
    enabled: query && query.length >= 2,
    // Don't cache search results for long
    staleTime: 1000 * 60,
  });
};

/**
 * Hook to check menu item availability
 * Why? Real-time availability status
 */
export const useItemAvailability = (itemId) => {
  return useQuery({
    queryKey: ['itemAvailability', itemId],
    queryFn: () => getMenuItemAvailability(itemId),
    enabled: !!itemId,
    // Check availability frequently
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};
