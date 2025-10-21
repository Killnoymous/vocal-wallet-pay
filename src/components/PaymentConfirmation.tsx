import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/upiParser';
import { CheckCircle2, User, Building2, IndianRupee } from 'lucide-react';

interface PaymentConfirmationProps {
  payeeName?: string;
  payeeVPA?: string;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PaymentConfirmation = ({
  payeeName,
  payeeVPA,
  amount,
  onConfirm,
  onCancel,
}: PaymentConfirmationProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-md glass-card rounded-2xl p-6 shadow-card animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4 shadow-glow">
            <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Confirm Payment</h2>
          <p className="text-sm text-muted-foreground">Review the details below</p>
        </div>

        <div className="space-y-4 mb-6">
          {payeeName && (
            <div className="flex items-center gap-3 glass-card rounded-xl p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Paying to</p>
                <p className="font-semibold">{payeeName}</p>
              </div>
            </div>
          )}

          {payeeVPA && (
            <div className="flex items-center gap-3 glass-card rounded-xl p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">UPI ID</p>
                <p className="font-mono text-sm">{payeeVPA}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 glass-card rounded-xl p-4 gradient-primary shadow-glow">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
              <IndianRupee className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-primary-foreground/80">Amount</p>
              <p className="text-2xl font-bold text-primary-foreground">{formatCurrency(amount)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={onConfirm} 
            className="w-full h-12 text-lg gradient-success shadow-glow"
          >
            Proceed to Authenticate
          </Button>
          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="w-full h-12"
          >
            Cancel Payment
          </Button>
        </div>
      </div>
    </div>
  );
};
