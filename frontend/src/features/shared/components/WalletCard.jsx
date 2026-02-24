import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import walletService from '../../../services/walletService';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

const WalletCard = ({ compact = false }) => {
  const { user } = useAuth();
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const queryClient = useQueryClient();

  // Fetch wallet balance
  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      return await walletService.getBalance();
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch transactions
  const {
    data: transactions,
    isLoading: transactionsLoading,
  } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: async () => {
      return await walletService.getTransactions();
    },
    enabled: showTransactionsModal,
    retry: 1,
  });

  // Topup mutation
  const topupMutation = useMutation({
    mutationFn: async (amount) => {
      return await walletService.topup(user.id, amount);
    },
    onSuccess: () => {
      toast.success('Wallet topped up successfully!');
      queryClient.invalidateQueries(['wallet-balance']);
      queryClient.invalidateQueries(['wallet-transactions']);
      setShowTopupModal(false);
      setTopupAmount('');
    },
    onError: (error) => {
      toast.error(error || 'Failed to topup wallet');
    },
  });

  const handleTopup = (e) => {
    e.preventDefault();
    const amount = parseFloat(topupAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > 10000) {
      toast.error('Maximum topup amount is ₹10,000');
      return;
    }

    topupMutation.mutate(amount);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (balanceLoading) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
        </div>
      </div>
    );
  }

  if (balanceError) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center text-red-600">
          <AlertCircle className="mr-2" size={20} />
          <span className="text-sm">Failed to load wallet</span>
          <button
            onClick={() => refetchBalance()}
            className="ml-auto text-brand-primary hover:text-brand-secondary"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl shadow-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">Wallet Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
          </div>
          <button
            onClick={() => setShowTopupModal(true)}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-colors"
          >
            <Plus className="text-white" size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl shadow-lg p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Your Wallet</p>
              <p className="font-semibold">{user?.username || 'User'}</p>
            </div>
          </div>
          <button
            onClick={() => refetchBalance()}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
          >
            <RefreshCw size={18} className="text-white" />
          </button>
        </div>

        {/* Balance */}
        <div className="mb-6">
          <p className="text-white/80 text-sm mb-2">Available Balance</p>
          <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowTopupModal(true)}
            className="flex-1 bg-white text-brand-primary font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center"
          >
            <Plus size={20} className="mr-2" />
            Top Up
          </button>
          <button
            onClick={() => setShowTransactionsModal(true)}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Transactions
          </button>
        </div>
      </div>

      {/* Topup Modal */}
      <Modal
        isOpen={showTopupModal}
        onClose={() => {
          setShowTopupModal(false);
          setTopupAmount('');
        }}
        title="Top Up Wallet"
      >
        <form onSubmit={handleTopup} className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance)}</p>
          </div>

          <Input
            label="Top Up Amount"
            type="number"
            placeholder="Enter amount (₹)"
            value={topupAmount}
            onChange={(e) => setTopupAmount(e.target.value)}
            required
            min="1"
            max="10000"
            step="0.01"
          />

          <div className="grid grid-cols-3 gap-2">
            {[100, 500, 1000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setTopupAmount(amount.toString())}
                className="py-2 px-4 border-2 border-gray-200 rounded-xl hover:border-brand-primary hover:text-brand-primary transition-colors font-semibold"
              >
                ₹{amount}
              </button>
            ))}
          </div>

          {topupAmount && (
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">New Balance</p>
              <p className="text-xl font-bold text-brand-primary">
                {formatCurrency(parseFloat(balance || 0) + parseFloat(topupAmount || 0))}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={topupMutation.isPending || !topupAmount}
            className="w-full py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {topupMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Processing...
              </>
            ) : (
              'Confirm Top Up'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Maximum topup amount: ₹10,000 per transaction
          </p>
        </form>
      </Modal>

      {/* Transactions Modal */}
      <Modal
        isOpen={showTransactionsModal}
        onClose={() => setShowTransactionsModal(false)}
        title="Transaction History"
      >
        {transactionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-brand-primary" size={32} />
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-600">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                        transaction.type === 'CREDIT'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {transaction.type === 'CREDIT' ? (
                        <ArrowUpCircle className="text-green-600" size={20} />
                      ) : (
                        <ArrowDownCircle className="text-red-600" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {transaction.description || transaction.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.type === 'CREDIT'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Balance: {formatCurrency(transaction.balanceAfter)}
                    </p>
                  </div>
                </div>
                {transaction.referenceId && (
                  <p className="text-xs text-gray-500">
                    Ref: {transaction.referenceType} #{transaction.referenceId}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
};

export default WalletCard;
