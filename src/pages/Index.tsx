import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { VoiceIndicator } from '@/components/VoiceIndicator';
import { QRScanner } from '@/components/QRScanner';
import { PaymentConfirmation } from '@/components/PaymentConfirmation';
import { PaymentSuccess } from '@/components/PaymentSuccess';
import { TransactionHistory } from '@/components/TransactionHistory';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { parseUPIQR, parseVoiceAmount, formatCurrency, UPIDetails } from '@/lib/upiParser';
import { getWalletData, saveTransaction, validateDemoPassphrase, generateTransactionId, Transaction } from '@/lib/storage';
import { Wallet, QrCode, Mic, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type FlowState = 
  | 'idle'
  | 'listening-activate'
  | 'scanning-qr'
  | 'listening-amount'
  | 'confirming-payment'
  | 'authenticating'
  | 'success'
  | 'history';

const Index = () => {
  const { toast } = useToast();
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [walletData, setWalletData] = useState(getWalletData());
  const [transcript, setTranscript] = useState('');
  const [upiDetails, setUpiDetails] = useState<UPIDetails | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [successTransaction, setSuccessTransaction] = useState<Transaction | null>(null);

  const handleVoiceResult = useCallback((result: { transcript: string; isFinal: boolean }) => {
    setTranscript(result.transcript);

    if (!result.isFinal) return;

    const normalized = result.transcript.toLowerCase().trim();

    // State-specific voice command handling
    switch (flowState) {
      case 'listening-activate':
        if (normalized.includes('upi') && normalized.includes('activate')) {
          toast({
            title: 'Activating UPI Scanner',
            description: 'Opening camera to scan QR code...',
          });
          setFlowState('scanning-qr');
        } else if (normalized.includes('cancel')) {
          setFlowState('idle');
          setTranscript('');
        }
        break;

      case 'listening-amount':
        if (normalized.includes('cancel')) {
          setFlowState('scanning-qr');
          setTranscript('');
        } else {
          const parsedAmount = parseVoiceAmount(result.transcript);
          if (parsedAmount && parsedAmount > 0) {
            setAmount(parsedAmount);
            toast({
              title: 'Amount Captured',
              description: `You said: ${formatCurrency(parsedAmount)}`,
            });
            setFlowState('confirming-payment');
          }
        }
        break;

      case 'authenticating':
        if (validateDemoPassphrase(result.transcript)) {
          handlePaymentSuccess();
        } else {
          toast({
            title: 'Authentication Failed',
            description: 'Incorrect passphrase. Try saying "open sesame 123"',
            variant: 'destructive',
          });
        }
        break;
    }
  }, [flowState, toast]);

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onResult: handleVoiceResult,
    onError: (error) => {
      toast({
        title: 'Voice Recognition Error',
        description: error,
        variant: 'destructive',
      });
    },
  });

  const handleActivateVoice = () => {
    setFlowState('listening-activate');
    setTranscript('');
    startListening();
    toast({
      title: 'Listening...',
      description: 'Say "UPI ACTIVATE" to start scanning',
    });
  };

  const handleQRScan = (qrData: string) => {
    const details = parseUPIQR(qrData);
    
    if (!details || !details.payeeVPA) {
      toast({
        title: 'Invalid QR Code',
        description: 'Please scan a valid UPI QR code',
        variant: 'destructive',
      });
      setFlowState('idle');
      return;
    }

    setUpiDetails(details);
    
    if (details.amount) {
      setAmount(details.amount);
      setFlowState('confirming-payment');
    } else {
      setFlowState('listening-amount');
      startListening();
      toast({
        title: 'QR Scanned Successfully',
        description: 'Now say the amount you want to pay',
      });
    }
  };

  const handleConfirmPayment = () => {
    setFlowState('authenticating');
    setTranscript('');
    startListening();
    toast({
      title: 'Authenticate Payment',
      description: 'Say your demo passphrase: "open sesame 123"',
    });
  };

  const handlePaymentSuccess = () => {
    if (!amount || !upiDetails) return;

    const transaction: Transaction = {
      id: generateTransactionId(),
      type: 'sent',
      amount,
      payeeName: upiDetails.payeeName,
      payeeVPA: upiDetails.payeeVPA,
      timestamp: Date.now(),
      status: 'success',
      transactionNote: upiDetails.transactionNote,
    };

    saveTransaction(transaction);
    setSuccessTransaction(transaction);
    setWalletData(getWalletData());
    setFlowState('success');
    stopListening();
    
    toast({
      title: 'Payment Successful! 🎉',
      description: `Paid ${formatCurrency(amount)} to ${upiDetails.payeeName}`,
    });
  };

  const handleReset = () => {
    setFlowState('idle');
    setTranscript('');
    setUpiDetails(null);
    setAmount(null);
    setSuccessTransaction(null);
    stopListening();
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="glass-card shadow-card">
        <div className="container max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full gradient-primary shadow-glow">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Lovable Wallet</h1>
                <p className="text-xs text-muted-foreground">Voice-Powered UPI</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFlowState(flowState === 'history' ? 'idle' : 'history')}
            >
              <History className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="glass-card rounded-xl p-4 gradient-primary shadow-glow">
            <p className="text-xs text-primary-foreground/80 mb-1">Demo Balance</p>
            <p className="text-3xl font-bold text-primary-foreground">
              {formatCurrency(walletData.balance)}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-lg mx-auto px-4 py-6">
        {flowState === 'history' ? (
          <TransactionHistory transactions={walletData.transactions} />
        ) : flowState === 'idle' ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to Pay?</h2>
              <p className="text-muted-foreground">
                Use your voice or scan a QR code to get started
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleActivateVoice}
                className="w-full h-20 text-lg gradient-primary shadow-glow"
                size="lg"
              >
                <Mic className="mr-3 h-6 w-6" />
                Activate Voice Payment
              </Button>

              <Button
                onClick={() => setFlowState('scanning-qr')}
                variant="outline"
                className="w-full h-20 text-lg"
                size="lg"
              >
                <QrCode className="mr-3 h-6 w-6" />
                Scan QR Code
              </Button>
            </div>

            <div className="glass-card rounded-xl p-6 space-y-2">
              <h3 className="font-semibold mb-3">How it works:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Say "UPI ACTIVATE" or tap scan button</li>
                <li>2. Scan merchant's QR code</li>
                <li>3. Say the amount (e.g., "two hundred rupees")</li>
                <li>4. Confirm and authenticate with voice</li>
                <li>5. Payment complete!</li>
              </ol>
              <p className="text-xs text-muted-foreground pt-3 border-t border-border">
                <strong>Demo passphrase:</strong> "open sesame 123"
              </p>
            </div>
          </div>
        ) : (flowState === 'listening-activate' || flowState === 'listening-amount' || flowState === 'authenticating') ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <VoiceIndicator isListening={isListening} transcript={transcript} />
            
            <div className="text-center max-w-md">
              {flowState === 'listening-activate' && (
                <>
                  <h2 className="text-2xl font-bold mb-2">Say "UPI ACTIVATE"</h2>
                  <p className="text-muted-foreground">
                    Or say "cancel" to go back
                  </p>
                </>
              )}
              {flowState === 'listening-amount' && (
                <>
                  <h2 className="text-2xl font-bold mb-2">Say the Amount</h2>
                  <p className="text-muted-foreground">
                    Example: "two hundred rupees" or "500 rupees"
                  </p>
                </>
              )}
              {flowState === 'authenticating' && (
                <>
                  <h2 className="text-2xl font-bold mb-2">Authenticate</h2>
                  <p className="text-muted-foreground">
                    Say: "open sesame 123"
                  </p>
                </>
              )}
            </div>

            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
          </div>
        ) : null}
      </main>

      {/* Overlays */}
      {flowState === 'scanning-qr' && (
        <QRScanner
          onScanComplete={handleQRScan}
          onClose={handleReset}
        />
      )}

      {flowState === 'confirming-payment' && amount && (
        <PaymentConfirmation
          payeeName={upiDetails?.payeeName}
          payeeVPA={upiDetails?.payeeVPA}
          amount={amount}
          onConfirm={handleConfirmPayment}
          onCancel={handleReset}
        />
      )}

      {flowState === 'success' && successTransaction && (
        <PaymentSuccess
          transaction={successTransaction}
          onDone={handleReset}
        />
      )}
    </div>
  );
};

export default Index;
