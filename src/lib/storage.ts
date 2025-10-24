import { apiService, Transaction, WalletData } from './api';

// Re-export types for backward compatibility
export type { Transaction, WalletData };

const DEMO_PASSPHRASE = 'harsh';

// Cache for wallet data to avoid repeated API calls
let walletDataCache: WalletData | null = null;
let currentUserId: string | null = null;
let currentUserName: string = 'Harsh'; // Default user

// Function to set current user
export const setCurrentUser = (userName: string) => {
  currentUserName = userName;
  // Clear cache when switching users
  walletDataCache = null;
  currentUserId = null;
};

// Function to get current user name
export const getCurrentUserName = () => currentUserName;

export const getWalletData = async (): Promise<WalletData> => {
  try {
    // Use the current user (defaults to Harsh)
    const user = await apiService.getUser(currentUserName);
    currentUserId = user.id;
    
    const transactions = await apiService.getUserTransactions(user.id);
    
    walletDataCache = {
      balance: user.balance,
      transactions
    };
    
    return walletDataCache;
  } catch (error) {
    console.error('Failed to load wallet data:', error);
    
    // Return fallback data if API fails
    return {
      balance: 10000,
      transactions: []
    };
  }
};

export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    if (!currentUserId) {
      throw new Error('No user ID available');
    }

    // Create transaction via API
    const newTransaction = await apiService.createTransaction({
      userId: currentUserId,
      type: transaction.type,
      amount: transaction.amount,
      payeeName: transaction.payeeName,
      payeeVPA: transaction.payeeVPA,
      transactionNote: transaction.transactionNote
    });

    // Update local cache
    if (walletDataCache) {
      walletDataCache.transactions.unshift(newTransaction);
      if (newTransaction.status === 'success') {
        if (newTransaction.type === 'sent') {
          walletDataCache.balance -= newTransaction.amount;
        } else {
          walletDataCache.balance += newTransaction.amount;
        }
      }
    }
  } catch (error) {
    console.error('Failed to save transaction:', error);
    throw error;
  }
};

export const validateDemoPassphrase = async (spokenPhrase: string): Promise<boolean> => {
  try {
    const normalized = spokenPhrase.toLowerCase().trim();
    
    // Debug logging to help troubleshoot
    console.log('Voice input:', spokenPhrase);
    console.log('Normalized:', normalized);
    console.log('Current user:', currentUserName);
    
    // Validate with API using current user
    const isValid = await apiService.validatePassphrase(currentUserName, normalized);
    console.log('API validation result:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('Failed to validate passphrase:', error);
    
    // Fallback to local validation if API fails
    const normalized = spokenPhrase.toLowerCase().trim();
    const target = currentUserName.toLowerCase();
    
    const exactMatch = normalized === target;
    const containsMatch = normalized.includes(target) || target.includes(normalized);
    
    // Add variations for both users
    const variations = currentUserName.toLowerCase() === 'harsh' 
      ? ['harsh', 'hash'] 
      : ['tanya', 'tania'];
    const variationMatch = variations.some(variation => 
      normalized.includes(variation) || variation.includes(normalized)
    );
    
    return exactMatch || containsMatch || variationMatch;
  }
};

export const generateTransactionId = (): string => {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
};

// Force refresh wallet data (clears cache and fetches fresh data)
export const refreshWalletData = async (): Promise<WalletData> => {
  // Clear cache to force fresh data fetch
  walletDataCache = null;
  currentUserId = null;
  
  return await getWalletData();
};
