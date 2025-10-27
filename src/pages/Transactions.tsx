import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TransactionHistory } from '@/components/TransactionHistory';
import { getWalletData } from '@/lib/storage';
import { formatCurrency } from '@/lib/upiParser';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Transactions = () => {
  const navigate = useNavigate();
  const [walletData] = useState(getWalletData());

  const totalReceived = walletData.transactions
    .filter(t => t.type === 'received' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSent = walletData.transactions
    .filter(t => t.type === 'sent' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="glass-card shadow-card">
        <div className="container max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full gradient-primary shadow-glow">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Transactions</h1>
                <p className="text-xs text-muted-foreground">Payment History</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 gradient-primary shadow-glow mb-4">
            <p className="text-xs text-primary-foreground/80 mb-1">Current Balance</p>
            <p className="text-3xl font-bold text-primary-foreground">
              {formatCurrency(walletData.balance)}
            </p>
          </div>

          {/* Transaction Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-700 font-medium">Received</p>
              </div>
              <p className="text-lg font-bold text-green-800">
                {formatCurrency(totalReceived)}
              </p>
            </div>
            
            <div className="glass-card rounded-xl p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <p className="text-xs text-red-700 font-medium">Sent</p>
              </div>
              <p className="text-lg font-bold text-red-800">
                {formatCurrency(totalSent)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Transaction History */}
      <main className="container max-w-lg mx-auto px-4 py-6">
        <TransactionHistory transactions={walletData.transactions} />
      </main>
    </div>
  );
};

export default Transactions;