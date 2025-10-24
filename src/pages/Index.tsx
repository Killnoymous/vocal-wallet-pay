import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { VoiceIndicator } from '@/components/VoiceIndicator';
import { FirefoxFallback } from '@/components/FirefoxFallback';
import { BrowserDetection } from '@/components/BrowserDetection';
import { QRScanner } from '@/components/QRScanner';
import { PaymentConfirmation } from '@/components/PaymentConfirmation';
import { PaymentSuccess } from '@/components/PaymentSuccess';
import { TransactionHistory } from '@/components/TransactionHistory';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { parseUPIQR, parseVoiceAmount, formatCurrency, UPIDetails } from '@/lib/upiParser';
import { getWalletData, saveTransaction, validateDemoPassphrase, generateTransactionId, Transaction, setCurrentUser, getCurrentUserName, refreshWalletData } from '@/lib/storage';
import { apiService } from '@/lib/api';
import { Wallet, QrCode, Mic, History, User, ChevronDown, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [walletData, setWalletData] = useState({ balance: 0, transactions: [] });
  const [transcript, setTranscript] = useState('');
  const [upiDetails, setUpiDetails] = useState<UPIDetails | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [successTransaction, setSuccessTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUserState] = useState(getCurrentUserName());

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
        validateDemoPassphrase(result.transcript).then((isValid) => {
          if (isValid) {
            handlePaymentSuccess();
          } else {
            toast({
              title: 'Authentication Failed',
              description: `Incorrect passphrase. Try saying "${currentUser}"`,
              variant: 'destructive',
            });
          }
        }).catch((error) => {
          console.error('Authentication error:', error);
          toast({
            title: 'Authentication Error',
            description: 'Failed to validate passphrase',
            variant: 'destructive',
          });
        });
        break;
    }
  }, [flowState, toast]);

  const { isListening, isSupported, fallbackMode, startListening, stopListening, simulateVoiceInput } = useVoiceRecognition({
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
      description: `Say your demo passphrase: "${currentUser}"`,
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

  const handlePaymentSuccess = async () => {
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

    try {
      await saveTransaction(transaction);
      setSuccessTransaction(transaction);
      
      // Refresh wallet data
      const updatedWalletData = await getWalletData();
      setWalletData(updatedWalletData);
      
      setFlowState('success');
      stopListening();
      
      toast({
        title: 'Payment Successful! 🎉',
        description: `Paid ${formatCurrency(amount)} to ${upiDetails.payeeName}`,
      });
    } catch (error) {
      console.error('Failed to save transaction:', error);
      toast({
        title: 'Transaction Failed',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setFlowState('idle');
    setTranscript('');
    setUpiDetails(null);
    setAmount(null);
    setSuccessTransaction(null);
    stopListening();
  };

  const handleUserSwitch = async (userName: string) => {
    try {
      setCurrentUser(userName);
      setCurrentUserState(userName);
      
      // Reload wallet data for the new user
      setIsLoading(true);
      const data = await getWalletData();
      setWalletData(data);
      
      // Disconnect old WebSocket and connect new one
      apiService.disconnectWebSocket();
      if (data.transactions.length > 0) {
        const userId = data.transactions[0].userId;
        apiService.connectWebSocket(userId, (newBalance) => {
          setWalletData(prev => ({ ...prev, balance: newBalance }));
        });
      }
      
      toast({
        title: 'User Switched',
        description: `Now logged in as ${userName}`,
      });
    } catch (error) {
      console.error('Failed to switch user:', error);
      toast({
        title: 'Switch Failed',
        description: 'Failed to switch user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await refreshWalletData();
      setWalletData(data);
      
      toast({
        title: 'Balance Refreshed',
        description: 'Wallet data updated successfully',
      });
    } catch (error) {
      console.error('Failed to refresh wallet:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh wallet data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial wallet data and set up WebSocket
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const data = await getWalletData();
        setWalletData(data);
        
        // Set up WebSocket connection for real-time balance updates
        if (data.transactions.length > 0) {
          // Get user ID from the first transaction
          const userId = data.transactions[0].userId;
          apiService.connectWebSocket(userId, (newBalance) => {
            setWalletData(prev => ({ ...prev, balance: newBalance }));
          });
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to server. Using offline mode.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    return () => {
      apiService.disconnectWebSocket();
    };
  }, [toast]);

  // Start listening automatically when component mounts and in idle state
  useEffect(() => {
    if (flowState === 'idle' && !isLoading) {
      startListening();
    }
  }, [flowState, startListening, isLoading]);

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
            <div className="flex items-center gap-2">
              <Select value={currentUser} onValueChange={handleUserSwitch}>
                <SelectTrigger className="w-32 h-10">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{currentUser}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Harsh">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Harsh</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Tanya">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Tanya</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
                title="Refresh balance"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFlowState(flowState === 'history' ? 'idle' : 'history')}
              >
                <History className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 gradient-primary shadow-glow">
            <p className="text-xs text-primary-foreground/80 mb-1">Demo Balance</p>
            <p className="text-3xl font-bold text-primary-foreground">
              {formatCurrency(walletData.balance)}
            </p>
          </div>
        </div>
      </header>

      {/* Browser Detection */}
      <BrowserDetection />

      {/* Main Content */}
      <main className="container max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading wallet data...</p>
          </div>
        ) : flowState === 'history' ? (
          <TransactionHistory transactions={walletData.transactions} />
        ) : flowState === 'idle' ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to Pay?</h2>
              <p className="text-muted-foreground">
                {fallbackMode ? "Use text input for commands" : "I'm listening for your voice commands"}
              </p>
            </div>

            {/* Voice Indicator or Firefox Fallback */}
            {fallbackMode ? (
              <FirefoxFallback
                onVoiceInput={(text) => simulateVoiceInput(text)}
                placeholder="Type 'UPI ACTIVATE' to start or 'scan QR' to open camera"
                title="Text Input Mode"
                description="Voice recognition not supported. Please type your commands."
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-6">
                <VoiceIndicator isListening={isListening} transcript={transcript} />
                
                <div className="text-center max-w-md">
                  <h3 className="text-lg font-semibold mb-2">Say "UPI ACTIVATE" to start</h3>
                  <p className="text-muted-foreground text-sm">
                    Or say "scan QR" to open camera directly
                  </p>
                </div>
              </div>
            )}

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
              <h3 className="font-semibold mb-3">
                {fallbackMode ? "Text Commands:" : "Voice Commands:"}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• "UPI ACTIVATE" - Start payment process</li>
                <li>• "scan QR" - Open QR scanner</li>
                <li>• "cancel" - Cancel current operation</li>
              </ul>
              <p className="text-xs text-muted-foreground pt-3 border-t border-border">
                <strong>Demo passphrase:</strong> "{currentUser}"
              </p>
            </div>
          </div>
        ) : (flowState === 'listening-activate' || flowState === 'listening-amount' || flowState === 'authenticating') ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            {fallbackMode ? (
              <FirefoxFallback
                onVoiceInput={(text) => simulateVoiceInput(text)}
                placeholder={
                  flowState === 'listening-activate' ? "Type 'UPI ACTIVATE' or 'cancel'" :
                  flowState === 'listening-amount' ? "Type amount like 'two hundred rupees'" :
                  "Type 'Harsh' for authentication"
                }
                title={
                  flowState === 'listening-activate' ? "Activation Required" :
                  flowState === 'listening-amount' ? "Enter Amount" :
                  "Authentication Required"
                }
                description={
                  flowState === 'listening-activate' ? "Type 'UPI ACTIVATE' to start or 'cancel' to go back" :
                  flowState === 'listening-amount' ? "Type the amount you want to pay" :
                  "Type your authentication password"
                }
              />
            ) : (
              <VoiceIndicator isListening={isListening} transcript={transcript} />
            )}
            
            <div className="text-center max-w-md">
              {flowState === 'listening-activate' && (
                <>
                  <h2 className="text-2xl font-bold mb-2">
                    {fallbackMode ? "Type 'UPI ACTIVATE'" : "Say 'UPI ACTIVATE'"}
                  </h2>
                  <p className="text-muted-foreground">
                    Or {fallbackMode ? "type" : "say"} "cancel" to go back
                  </p>
                </>
              )}
              {flowState === 'listening-amount' && (
                <>
                  <h2 className="text-2xl font-bold mb-2">
                    {fallbackMode ? "Type the Amount" : "Say the Amount"}
                  </h2>
                  <p className="text-muted-foreground">
                    Example: "two hundred rupees" or "500 rupees"
                  </p>
                </>
              )}
              {flowState === 'authenticating' && (
                <>
                  <h2 className="text-2xl font-bold mb-2">Authenticate</h2>
                  <p className="text-muted-foreground">
                    Say: "{currentUser}"
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
