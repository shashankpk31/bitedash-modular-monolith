// Wallet Query Hooks
// Why? Manages wallet balance, transactions, and credits/debits

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getMyWallet,
  getWalletByUserId,
  getWalletBalance,
  getWalletTransactions,
  getBalanceHistory,
  getTotalCredits,
  getTotalDebits,
  creditWallet,
  debitWallet,
  initializeWallet,
} from '../api/wallet.api';
import { QUERY_KEYS, TOAST_DURATION } from '../../config/constants';

/**
 * Hook to get current user's wallet
 * Why? Main wallet display with balance and details
 */
export const useMyWallet = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MY_WALLET,
    queryFn: getMyWallet,
    // Keep wallet data fresh
    staleTime: 1000 * 60 * 2,
    // Refetch on window focus to show updated balance
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to get wallet by user ID (admin only)
 */
export const useUserWallet = (userId) => {
  return useQuery({
    queryKey: ['userWallet', userId],
    queryFn: () => getWalletByUserId(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook to get wallet balance
 * Why? Quick balance check without full wallet details
 */
export const useWalletBalance = () => {
  return useQuery({
    queryKey: QUERY_KEYS.WALLET_BALANCE,
    queryFn: getWalletBalance,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to get wallet transactions
 * Why? Transaction history with filters and pagination
 */
export const useWalletTransactions = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WALLET_TRANSACTIONS, params],
    queryFn: () => getWalletTransactions(params),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get balance history chart data
 * Why? Visual representation of balance over time
 */
export const useBalanceHistory = (params = {}) => {
  return useQuery({
    queryKey: ['balanceHistory', params],
    queryFn: () => getBalanceHistory(params),
    enabled: !!(params.startDate && params.endDate),
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook to get total credits
 * Why? Shows lifetime credits received
 */
export const useTotalCredits = () => {
  return useQuery({
    queryKey: ['totalCredits'],
    queryFn: getTotalCredits,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook to get total debits
 * Why? Shows lifetime spending
 */
export const useTotalDebits = () => {
  return useQuery({
    queryKey: ['totalDebits'],
    queryFn: getTotalDebits,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook to credit wallet (admin only)
 * Why mutation? Adds money to user's wallet
 */
export const useCreditWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: creditWallet,
    onSuccess: (data, variables) => {
      // Invalidate wallet queries to show updated balance
      if (variables.userId) {
        queryClient.invalidateQueries(['userWallet', variables.userId]);
      }
      queryClient.invalidateQueries(QUERY_KEYS.MY_WALLET);
      queryClient.invalidateQueries(QUERY_KEYS.WALLET_BALANCE);
      queryClient.invalidateQueries(QUERY_KEYS.WALLET_TRANSACTIONS);

      toast.success('Wallet credited successfully!', {
        duration: TOAST_DURATION.SUCCESS,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to credit wallet.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

/**
 * Hook to debit wallet (admin only or payment)
 * Why mutation? Deducts money from wallet
 */
export const useDebitWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: debitWallet,
    onSuccess: (data, variables) => {
      if (variables.userId) {
        queryClient.invalidateQueries(['userWallet', variables.userId]);
      }
      queryClient.invalidateQueries(QUERY_KEYS.MY_WALLET);
      queryClient.invalidateQueries(QUERY_KEYS.WALLET_BALANCE);
      queryClient.invalidateQueries(QUERY_KEYS.WALLET_TRANSACTIONS);

      toast.success('Payment processed successfully!', {
        duration: TOAST_DURATION.SUCCESS,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Payment failed. Please try again.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};

/**
 * Hook to initialize wallet (admin only)
 * Why mutation? Creates wallet for new user
 */
export const useInitializeWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: initializeWallet,
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries(['userWallet', userId]);

      toast.success('Wallet initialized successfully!', {
        duration: TOAST_DURATION.SUCCESS,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to initialize wallet.', {
        duration: TOAST_DURATION.ERROR,
      });
    },
  });
};
