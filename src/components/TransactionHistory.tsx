import { formatCurrency } from '@/lib/upiParser';
import { Transaction } from '@/lib/storage';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-4 glass-card rounded-xl p-4 hover:bg-card/50 transition-colors"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  transaction.type === 'received'
                    ? 'bg-success/20'
                    : 'bg-primary/20'
                }`}
              >
                {transaction.type === 'received' ? (
                  <ArrowDownLeft className="h-5 w-5 text-success" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {transaction.payeeName || 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(transaction.timestamp).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`font-bold ${
                    transaction.type === 'received'
                      ? 'text-success'
                      : 'text-foreground'
                  }`}
                >
                  {transaction.type === 'received' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {transaction.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
