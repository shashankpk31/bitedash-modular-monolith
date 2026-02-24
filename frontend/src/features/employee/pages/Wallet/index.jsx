import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, TrendingDown, Clock, Loader2 } from 'lucide-react';
import api from '../../../../api/axiosInstance';
import toast from 'react-hot-toast';

const EmployeeWallet = () => {
  // Fetch wallet data
  const { data: wallet, isLoading } = useQuery({
    queryKey: ['my-wallet'],
    queryFn: async () => {
      const response = await api.get('/wallet/my-wallet');
      return response.data;
    },
    retry: 1,
  });

  // Fetch recent transactions
  const { data: transactions } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: async () => {
      const response = await api.get('/wallet/transactions?limit=10');
      return response.data || [];
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin text-brand-primary mx-auto mb-4" size={40} />
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-8 px-4 md:px-6 mb-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">My Wallet</h1>
          <p className="text-base md:text-lg opacity-90">
            Manage your balance and transactions
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-2xl p-8 mb-6 text-white">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-sm opacity-75">Current Balance</p>
                <p className="text-4xl font-bold">
                  ₹{wallet?.balance?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp size={18} />
                <p className="text-sm opacity-75">Total Credits</p>
              </div>
              <p className="text-2xl font-bold">₹{wallet?.totalCredits || '0'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown size={18} />
                <p className="text-sm opacity-75">Total Spent</p>
              </div>
              <p className="text-2xl font-bold">₹{wallet?.totalDebits || '0'}</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-gray-600" />
            Recent Transactions
          </h2>

          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-600">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        txn.type === 'CREDIT'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {txn.type === 'CREDIT' ? (
                        <TrendingUp size={20} />
                      ) : (
                        <TrendingDown size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {txn.description || txn.type}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(txn.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount?.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Balance: ₹{txn.balanceAfter?.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Money Button - Placeholder */}
        <div className="mt-6">
          <button
            onClick={() => toast('Add money feature coming soon!', { icon: '🔜' })}
            className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all"
          >
            Add Money to Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeWallet;
