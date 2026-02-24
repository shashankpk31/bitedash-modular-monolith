import api from '../api/axiosInstance';

const walletService = {
  // Get My Wallet
  getMyWallet: async () => {
    const response = await api.get('/wallet/my-wallet');
    return response;
  },

  // Get Wallet by User ID
  getWalletByUserId: async (userId) => {
    const response = await api.get(`/wallet/user/${userId}`);
    return response;
  },

  // Get Current Balance
  getBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response;
  },

  // Credit Wallet (Top-up)
  topup: async (userId, amount, description = 'Wallet Top-up', referenceId = null, referenceType = 'TOPUP') => {
    const params = new URLSearchParams({
      userId: userId.toString(),
      amount: amount.toString(),
      description,
    });
    if (referenceId) params.append('referenceId', referenceId.toString());
    if (referenceType) params.append('referenceType', referenceType);

    const response = await api.post(`/wallet/credit?${params}`);
    return response;
  },

  // Debit Wallet (Internal use - called by order service)
  debit: async (userId, amount, description, referenceId = null, referenceType = 'ORDER') => {
    const params = new URLSearchParams({
      userId: userId.toString(),
      amount: amount.toString(),
      description,
    });
    if (referenceId) params.append('referenceId', referenceId.toString());
    if (referenceType) params.append('referenceType', referenceType);

    const response = await api.post(`/wallet/debit?${params}`);
    return response;
  },

  // Get Transaction History
  getTransactions: async () => {
    const response = await api.get('/wallet/transactions');
    return response;
  },

  // Get Balance History
  getBalanceHistory: async (startDate = null, endDate = null) => {
    let url = '/wallet/balance-history';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) url += `?${params}`;
    
    const response = await api.get(url);
    return response;
  },

  // Get Total Credits
  getTotalCredits: async () => {
    const response = await api.get('/wallet/total-credits');
    return response;
  },

  // Get Total Debits
  getTotalDebits: async () => {
    const response = await api.get('/wallet/total-debits');
    return response;
  },

  // Initialize Wallet (Called after user registration)
  initWallet: async (userId) => {
    const response = await api.post(`/wallet/init/${userId}`);
    return response;
  },
};

export default walletService;
