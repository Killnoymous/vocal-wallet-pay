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
      case 'idle':
        // Constant listening in idle state
        if (normalized.includes('upi') && normalized.includes('activate')) {
          toast({
            title: 'Activating UPI Scanner',
            description: 'Opening camera to scan QR code...',
          });
          setFlowState('scanning-qr');
        } else if (normalized.includes('scan') || normalized.includes('qr')) {
          toast({
            title: 'Opening QR Scanner',
            description: 'Camera activated for QR scanning...',
          });
          setFlowState('scanning-qr');
        }
        break;

      case 'listening-activate':
        if (normalized.includes('upi') && normalized.includes('activate')) {
          toast({
            title: 'Activating UPI Scanner',
            description: 'Opening camera to scan QR code...',
          });
          stopListening();
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
            stopListening();
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
              description: 'Incorrect passphrase. Try saying "Harsh"',
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
      description: 'Say your demo passphrase: "Harsh"',
    });
  };

  const handleBackToAmount = () => {
    setFlowState('listening-amount');
    setTranscript('');
    startListening();
    toast({
      title: 'Enter Amount Again',
      description: 'Say the amount you want to pay',
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

  // Start listening automatically when component mounts and in idle state
  useEffect(() => {
    if (flowState === 'idle') {
      startListening();
    }
  }, [flowState, startListening]);

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
                I'm listening for your voice commands
              </p>
            </div>

            {/* Voice Indicator for constant listening */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <VoiceIndicator isListening={isListening} transcript={transcript} />
              
              <div className="text-center max-w-md">
                <h3 className="text-lg font-semibold mb-2">Say "UPI ACTIVATE" to start</h3>
                <p className="text-muted-foreground text-sm">
                  Or say "scan QR" to open camera directly
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => setFlowState('scanning-qr')}
                variant="outline"
                className="w-full h-20 text-lg"
                size="lg"
              >
                <QrCode className="mr-3 h-6 w-6" />
                Scan QR Code Manually
              </Button>
            </div>

            <div className="glass-card rounded-xl p-6 space-y-2">
              <h3 className="font-semibold mb-3">Voice Commands:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• "UPI ACTIVATE" - Start payment process</li>
                <li>• "scan QR" - Open QR scanner</li>
                <li>• "cancel" - Cancel current operation</li>
              </ul>
              <p className="text-xs text-muted-foreground pt-3 border-t border-border">
                <strong>Demo passphrase:</strong> "Harsh"
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
                    Say: "Harsh"
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
          onCancel={handleBackToAmount}
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
