const API_BASE_URL = "https://drishti-ws-server.onrender.com/api" ;


export interface User {
  id: string;
  name: string;
  balance: number;
  passphrase: string;
}

export interface Transaction {
  id: string;
  userId: string;
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

class ApiService {
  private ws: WebSocket | null = null;
  private onBalanceUpdate: ((balance: number) => void) | null = null;

  // WebSocket connection for real-time balance updates
  connectWebSocket(userId: string, onBalanceUpdate: (balance: number) => void) {
    this.onBalanceUpdate = onBalanceUpdate;
    
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket('ws://localhost:3001');
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.ws?.send(JSON.stringify({ type: 'subscribe', userId }));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'balance_update') {
          this.onBalanceUpdate?.(data.balance);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (this.onBalanceUpdate) {
          this.connectWebSocket(userId, this.onBalanceUpdate);
        }
      }, 3000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.onBalanceUpdate = null;
    }
  }

  // Get user by name
  async getUser(name: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${name}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return response.json();
  }

  // Validate user passphrase
  async validatePassphrase(name: string, passphrase: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/users/${name}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ passphrase }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to validate passphrase: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.valid;
  }

  // Get user transactions
  async getUserTransactions(userId: string, limit = 50, offset = 0): Promise<Transaction[]> {
    const response = await fetch(
      `${API_BASE_URL}/transactions/${userId}?limit=${limit}&offset=${offset}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Create a new transaction
  async createTransaction(transactionData: {
    userId: string;
    type: 'sent' | 'received';
    amount: number;
    payeeName?: string;
    payeeVPA?: string;
    transactionNote?: string;
  }): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create transaction: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Update user balance directly
  async updateUserBalance(name: string, balance: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${name}/balance`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ balance }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update balance: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get wallet data (balance + transactions)
  async getWalletData(userId: string): Promise<WalletData> {
    const [user, transactions] = await Promise.all([
      this.getUser('Harsh'), // For demo, we'll use Harsh as the main user
      this.getUserTransactions(userId)
    ]);

    return {
      balance: user.balance,
      transactions
    };
  }
}

export const apiService = new ApiService();