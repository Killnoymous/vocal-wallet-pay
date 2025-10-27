export interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  payeeName?: string;
  payeeVPA?: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  transactionNote?: string;
}

export interface WalletData {
  balance: number;
  transactions: Transaction[];
}

const STORAGE_KEY = 'upi_wallet_data';
const DEMO_PASSPHRASE = 'harsh';

export const getWalletData = (): WalletData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load wallet data:', error);
  }

  // Return initial demo data
  return {
    balance: 15000, // ₹15,000 demo balance
    transactions: [
      {
        id: 'demo-1',
        type: 'received',
        amount: 15000,
        payeeName: 'Sicario',
        timestamp: Date.now() - 86400000,
        status: 'success',
        transactionNote: 'Demo balance deposited by Sicario',
      },
    ],
  };
};

export const saveTransaction = (transaction: Transaction): void => {
  const walletData = getWalletData();
  
  // Update balance
  if (transaction.status === 'success') {
    if (transaction.type === 'sent') {
      walletData.balance -= transaction.amount;
    } else {
      walletData.balance += transaction.amount;
    }
  }

  // Add transaction
  walletData.transactions.unshift(transaction);

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(walletData));
};

export const validateDemoPassphrase = (spokenPhrase: string): boolean => {
  const normalized = spokenPhrase.toLowerCase().trim();
  const target = DEMO_PASSPHRASE.toLowerCase();
  
  // Allow for some flexibility in speech recognition
  // Check for exact match, contains match, or similar sounding words
  const exactMatch = normalized === target;
  const containsMatch = normalized.includes(target) || target.includes(normalized);
  
  // Handle common speech recognition variations for "harsh"
  // Common misrecognitions: "hash", "harsh", etc.
  const variations = ['harsh', 'hash'];
  const variationMatch = variations.some(variation => 
    normalized.includes(variation) || variation.includes(normalized)
  );
  
  // Debug logging to help troubleshoot
  console.log('Voice input:', spokenPhrase);
  console.log('Normalized:', normalized);
  console.log('Target:', target);
  console.log('Exact match:', exactMatch);
  console.log('Contains match:', containsMatch);
  console.log('Variation match:', variationMatch);
  
  return exactMatch || containsMatch || variationMatch;
};

export const generateTransactionId = (): string => {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
};

export const resetDemoData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
