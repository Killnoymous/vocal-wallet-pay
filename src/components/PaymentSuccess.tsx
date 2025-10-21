import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/upiParser';
import { CheckCircle, Download, Home } from 'lucide-react';
import { Transaction } from '@/lib/storage';

interface PaymentSuccessProps {
  transaction: Transaction;
  onDone: () => void;
}

export const PaymentSuccess = ({ transaction, onDone }: PaymentSuccessProps) => {
  const handleDownloadReceipt = () => {
    // In a real app, this would generate a PDF receipt
    console.log('Download receipt:', transaction.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-md glass-card rounded-2xl p-6 shadow-card animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-success mb-4 shadow-glow animate-in zoom-in duration-500">
            <CheckCircle className="h-10 w-10 text-success-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent">
            Payment Successful!
          </h2>
          <p className="text-sm text-muted-foreground">Your payment has been processed</p>
        </div>

        <div className="glass-card rounded-xl p-6 mb-6 space-y-4">
          <div className="text-center pb-4 border-b border-border">
            <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
            <p className="text-4xl font-bold text-success">{formatCurrency(transaction.amount)}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">To</span>
              <span className="text-sm font-medium">{transaction.payeeName || 'Merchant'}</span>
            </div>
            {transaction.payeeVPA && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">UPI ID</span>
                <span className="text-sm font-mono">{transaction.payeeVPA}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Transaction ID</span>
              <span className="text-sm font-mono">{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date & Time</span>
              <span className="text-sm">{new Date(transaction.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-sm font-medium text-success">Success</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleDownloadReceipt}
            variant="outline" 
            className="w-full h-12"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          <Button 
            onClick={onDone} 
            className="w-full h-12 gradient-primary shadow-glow"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};
