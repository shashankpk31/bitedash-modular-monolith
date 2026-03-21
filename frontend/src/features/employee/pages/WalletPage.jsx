import { useState } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, History, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../../common/components/Button';
import Badge from '../../../common/components/Badge';
import { ContentLoader } from '../../../common/components/Spinner';
import {
  useMyWallet,
  useWalletTransactions,
  useTotalCredits,
  useTotalDebits,
} from '../../../services/queries/wallet.queries';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../../../common/utils';

// Wallet Page - View balance and transactions
// Why? Employees need to track their meal credits and spending
const WalletPage = () => {
  const [transactionFilter, setTransactionFilter] = useState('all');

  // Fetch wallet data
  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = useMyWallet();
  const { data: transactions, isLoading: transactionsLoading } = useWalletTransactions({
    type: transactionFilter !== 'all' ? transactionFilter : undefined,
  });
  const { data: totalCredits } = useTotalCredits();
  const { data: totalDebits } = useTotalDebits();

  // Transaction type filters
  const filters = [
    { value: 'all', label: 'All' },
    { value: 'CREDIT', label: 'Credits' },
    { value: 'DEBIT', label: 'Debits' },
  ];

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="p-4 bg-surface-container-low border-b border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-display-sm text-on-surface">My Wallet</h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Track your balance and transactions
            </p>
          </div>
          <button
            onClick={() => refetchWallet()}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <RefreshCw size={20} className="text-on-surface-variant" />
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-4">
        {walletLoading ? (
          <div className="bg-surface-container-lowest rounded-xl p-6">
            <ContentLoader message="Loading wallet..." />
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-primary to-primary-dim rounded-2xl p-6 text-on-primary shadow-primary"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-label-md text-on-primary/80 uppercase tracking-wide mb-2">
                  Available Balance
                </div>
                <div className="font-headline text-display-md text-on-primary">
                  {formatCurrency(wallet?.balance || 0)}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-on-primary/20 flex items-center justify-center">
                <Wallet size={24} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-on-primary/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpCircle size={16} />
                  <span className="text-label-sm opacity-80">Total Credits</span>
                </div>
                <div className="font-headline text-headline-sm">
                  {formatCurrency(totalCredits || 0)}
                </div>
              </div>
              <div className="bg-on-primary/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownCircle size={16} />
                  <span className="text-label-sm opacity-80">Total Spent</span>
                </div>
                <div className="font-headline text-headline-sm">
                  {formatCurrency(totalDebits || 0)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Transactions */}
      <div className="p-4 space-y-4">
        {/* Header with filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <History size={20} className="text-on-surface-variant" />
            <h2 className="font-headline text-headline-md text-on-surface">
              Transaction History
            </h2>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {filters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setTransactionFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-label-md font-semibold transition-colors ${
                  transactionFilter === filter.value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {transactionsLoading && <ContentLoader message="Loading transactions..." />}

        {/* Empty State */}
        {!transactionsLoading && (!transactions || transactions.length === 0) && (
          <div className="text-center py-12 space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container flex items-center justify-center">
              <History size={32} className="text-on-surface-variant opacity-40" />
            </div>
            <h3 className="font-headline text-headline-sm text-on-surface">
              No Transactions Yet
            </h3>
            <p className="text-body-md text-on-surface-variant">
              {transactionFilter === 'all'
                ? 'Your transaction history will appear here'
                : `No ${transactionFilter.toLowerCase()} transactions found`}
            </p>
          </div>
        )}

        {/* Transactions List */}
        {!transactionsLoading && transactions && transactions.length > 0 && (
          <div className="space-y-2">
            {transactions.map(transaction => {
              const isCredit = transaction.type === 'CREDIT';
              return (
                <motion.div
                  key={transaction.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface-container-lowest rounded-xl p-4 shadow-card flex items-center gap-4"
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCredit
                        ? 'bg-green-500/10'
                        : 'bg-error/10'
                    }`}
                  >
                    {isCredit ? (
                      <ArrowUpCircle size={20} className="text-green-600" />
                    ) : (
                      <ArrowDownCircle size={20} className="text-error" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-headline text-body-md text-on-surface">
                      {transaction.description || (isCredit ? 'Credit' : 'Debit')}
                    </div>
                    <div className="text-label-sm text-on-surface-variant mt-1">
                      {formatRelativeTime(transaction.createdAt)}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div
                      className={`font-headline text-headline-sm ${
                        isCredit ? 'text-green-600' : 'text-error'
                      }`}
                    >
                      {isCredit ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                    {transaction.balanceAfter !== undefined && (
                      <div className="text-label-sm text-on-surface-variant mt-1">
                        Bal: {formatCurrency(transaction.balanceAfter)}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
