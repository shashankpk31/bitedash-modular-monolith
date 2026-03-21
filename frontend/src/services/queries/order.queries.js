// Order Query Hooks
// Why? Manages order placement, tracking, and history with real-time updates

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrderHistory,
  cancelOrder,
  rateOrder,
  getActiveOrder,
  getVendorOrders,
  updateOrderStatus,
} from '../api/order.api';
import { useCart } from '../../contexts/CartContext';
import { QUERY_KEYS, TOAST_DURATION, ROUTES } from '../../config/constants';

/**
 * Hook to create a new order
 * Why mutation? Creates server-side order and deducts wallet balance
 */
export const useCreateOrder = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      // Clear cart after successful order
      clearCart();

      // Invalidate relevant queries to fetch fresh data
      queryClient.invalidateQueries(QUERY_KEYS.MY_ORDERS);
      queryClient.invalidateQueries(QUERY_KEYS.MY_WALLET);
      queryClient.invalidateQueries(QUERY_KEYS.WALLET_BALANCE);

      toast.success('Order placed successfully!', {
        duration: TOAST_DURATION.SUCCESS,
      });

      // Navigate to order confirmation page
      navigate(`/employee/orders/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to place order. Please try again.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

/**
 * Hook to get order details
 * Why? Shows order confirmation and tracking details
 */
export const useOrder = (orderId) => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER_BY_ID(orderId),
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
    // Refetch frequently for real-time status updates
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

/**
 * Hook to get user's orders
 * Why? Order history page with filters
 */
export const useMyOrders = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_ORDERS, params],
    queryFn: () => getMyOrders(params),
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook to get order timeline/history
 * Why? Shows order status progression
 */
export const useOrderHistory = (orderId) => {
  return useQuery({
    queryKey: ['orderHistory', orderId],
    queryFn: () => getOrderHistory(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60,
  });
};

/**
 * Hook to cancel an order
 * Why mutation? Modifies order status server-side
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }) => cancelOrder(orderId, reason),
    onSuccess: (data, variables) => {
      // Invalidate order queries to show updated status
      queryClient.invalidateQueries(QUERY_KEYS.ORDER_BY_ID(variables.orderId));
      queryClient.invalidateQueries(QUERY_KEYS.MY_ORDERS);
      queryClient.invalidateQueries(QUERY_KEYS.MY_WALLET); // Refund updates wallet

      toast.success('Order cancelled successfully. Refund will be processed.', {
        duration: TOAST_DURATION.SUCCESS,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel order.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

/**
 * Hook to rate an order
 * Why mutation? Submits rating and review
 */
export const useRateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, rating, review }) => rateOrder(orderId, { rating, review }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(QUERY_KEYS.ORDER_BY_ID(variables.orderId));
      queryClient.invalidateQueries(QUERY_KEYS.MY_ORDERS);

      toast.success('Thank you for your feedback!', {
        duration: TOAST_DURATION.SUCCESS,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit rating.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

/**
 * Hook to get active order for tracking
 * Why? Shows currently processing order with real-time updates
 */
export const useActiveOrder = () => {
  return useQuery({
    queryKey: ['activeOrder'],
    queryFn: getActiveOrder,
    // Poll frequently for real-time tracking
    staleTime: 1000 * 20, // 20 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    // Continue fetching even when window is not focused
    refetchIntervalInBackground: true,
  });
};

/**
 * Hook to get vendor orders (vendor only)
 * Why? Vendor dashboard to manage incoming orders
 */
export const useVendorOrders = (vendorId, params = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.VENDOR_ORDERS(vendorId),
    queryFn: () => getVendorOrders(vendorId, params),
    enabled: !!vendorId,
    // Poll for new orders
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
};

/**
 * Hook to update order status (vendor only)
 * Why mutation? Vendor updates order progress (confirmed → preparing → ready)
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(QUERY_KEYS.ORDER_BY_ID(variables.orderId));
      queryClient.invalidateQueries(QUERY_KEYS.VENDOR_ORDERS());

      toast.success(`Order status updated to ${variables.status}`, {
        duration: TOAST_DURATION.SUCCESS,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order status.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

// Alias export for useOrder as useOrderById for backward compatibility
export const useOrderById = useOrder;
