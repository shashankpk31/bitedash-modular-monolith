import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import Card from '../../../components/ui/Card';
import { motion } from 'framer-motion';
import walletService from '../../../services/walletService';

const WalletPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletService.getMyWallet,
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: walletService.getTransactions,
  });

  const topUpAmounts = [10, 20, 50];

  const filteredTransactions = transactions.filter(transaction => {
    if (activeFilter === 'all') return true;
    return transaction.type === activeFilter.toUpperCase();
  });

  const getTransactionIcon = (type) => {
    const icons = {
      CREDIT: { name: 'account_balance_wallet', bg: 'bg-success/10', text: 'text-success' },
      DEBIT: { name: 'restaurant', bg: 'bg-error/10', text: 'text-error' },
      TOPUP: { name: 'add_circle', bg: 'bg-info/10', text: 'text-info' },
    };
    return icons[type] || icons.CREDIT;
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Icon name="arrow_back" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Wallet</h1>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Icon name="notifications" />
          </button>
        </div>
      </header>

      {loadingWallet ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Balance Card */}
          <div className="px-4 py-6">
            <Card className="bg-gradient-to-br from-primary to-primary-dark text-white" padding="lg">
              <p className="text-white/80 text-sm mb-2 uppercase tracking-wide">Current Balance</p>
              <h2 className="text-4xl font-bold mb-3">${(wallet?.balance || 0).toFixed(2)}</h2>
              {wallet?.weeklyChange && (
                <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm">
                  <Icon name="trending_up" size={16} />
                  <span>+${Math.abs(wallet.weeklyChange).toFixed(2)} this week</span>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Top-up */}
          <div className="px-4 mb-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">Quick Top-up</h3>
            <div className="grid grid-cols-4 gap-3">
              {topUpAmounts.map(amount => (
                <motion.button
                  key={amount}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center font-bold text-primary hover:bg-primary hover:text-white transition-colors border-2 border-gray-200 dark:border-gray-700 hover:border-primary"
                >
                  ${amount}
                </motion.button>
              ))}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white rounded-xl p-4 text-center font-bold hover:bg-primary-light transition-colors"
              >
                <Icon name="add" size={24} />
              </motion.button>
            </div>
          </div>

          {/* Transactions */}
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Transactions</h3>
              <button className="text-sm font-semibold text-primary">View All</button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
              {['all', 'credits', 'debits'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    activeFilter === filter
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction List */}
          <div className="px-4 space-y-3">
            {loadingTransactions ? (
              <div className="flex justify-center py-12">
                <Spinner size="md" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="receipt_long" size={48} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => {
                const iconConfig = getTransactionIcon(transaction.type);
                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-full ${iconConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon name={iconConfig.name} className={iconConfig.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.timestamp).toLocaleDateString()} • {new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`text-lg font-bold ${transaction.type === 'DEBIT' ? 'text-error' : 'text-success'}`}>
                      {transaction.type === 'DEBIT' ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WalletPage;
