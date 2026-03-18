import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon';
import Badge from '../../../../components/ui/Badge';
import walletService from '../../../../services/walletService';

const WalletTransactions = () => {
  const navigate = useNavigate();
  const { data: wallet } = useQuery({ queryKey: ['wallet'], queryFn: walletService.getMyWallet });
  const { data: transactions = [] } = useQuery({ queryKey: ['transactions'], queryFn: walletService.getTransactions });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <header className="sticky top-0 bg-primary text-white p-6 rounded-b-3xl shadow-lg">
        <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-white/10 mb-4">
          <Icon name="arrow_back" />
        </button>
        <div className="text-center">
          <p className="text-sm opacity-90 mb-1">Available Balance</p>
          <h1 className="text-5xl font-bold mb-2">${(wallet?.balance || 0).toFixed(2)}</h1>
          <div className="flex gap-4 justify-center">
            <button className="bg-white/20 backdrop-blur px-6 py-2 rounded-xl font-semibold text-sm">
              <Icon name="add" size={18} className="inline mr-1" /> Top Up
            </button>
            <button className="bg-white/20 backdrop-blur px-6 py-2 rounded-xl font-semibold text-sm">
              <Icon name="history" size={18} className="inline mr-1" /> History
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <h2 className="font-bold text-lg mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {(transactions.length > 0 ? transactions : mockTransactions).map((txn, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className={`size-10 rounded-full flex items-center justify-center ${txn.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <Icon name={txn.type === 'CREDIT' ? 'arrow_downward' : 'arrow_upward'} size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">{txn.description}</p>
                    <p className="text-xs text-slate-500">{new Date(txn.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`font-bold ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.type === 'CREDIT' ? '+' : '-'}${txn.amount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const mockTransactions = [
  { id: 1, type: 'DEBIT', amount: 28.50, description: 'Order #BD-1092', createdAt: new Date() },
  { id: 2, type: 'CREDIT', amount: 50.00, description: 'Monthly Subsidy', createdAt: new Date(Date.now() - 86400000) },
];

export default WalletTransactions;
