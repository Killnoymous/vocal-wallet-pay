import { Button } from '@/components/ui/button';
import { VoiceIndicator } from '@/components/VoiceIndicator';
import { formatCurrency } from '@/lib/upiParser';
import { CheckCircle2, User, Building2, IndianRupee, Mic } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [transcript, setTranscript] = useState('');

  const handleVoiceResult = useCallback((result: { transcript: string; isFinal: boolean }) => {
    setTranscript(result.transcript);

    if (!result.isFinal) return;

    const normalized = result.transcript.toLowerCase().trim();

    if (normalized.includes('yes') || normalized.includes('proceed') || normalized.includes('confirm')) {
      toast({
        title: 'Proceeding to Authentication',
        description: 'Moving to voice authentication...',
      });
      onConfirm();
    } else if (normalized.includes('no') || normalized.includes('cancel') || normalized.includes('back')) {
      toast({
        title: 'Going Back',
        description: 'Returning to amount entry...',
      });
      onCancel();
    }
  }, [onConfirm, onCancel, toast]);

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

  // Start listening when component mounts
  useEffect(() => {
    startListening();
    toast({
      title: 'Voice Commands Active',
      description: 'Say "Yes" to proceed or "No" to go back',
    });

    return () => {
      stopListening();
    };
  }, [startListening, stopListening, toast]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-md glass-card rounded-2xl p-6 shadow-card animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4 shadow-glow">
            <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Confirm Payment</h2>
          <p className="text-sm text-muted-foreground">Review the details and respond with voice</p>
        </div>

        {/* Voice Indicator */}
        <div className="flex flex-col items-center justify-center mb-6">
          <VoiceIndicator isListening={isListening} transcript={transcript} />
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

        {/* Voice Commands Instructions */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Mic className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Voice Commands:</h3>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Say <strong>"Yes"</strong> or <strong>"Proceed"</strong> to authenticate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Say <strong>"No"</strong> or <strong>"Cancel"</strong> to go back</span>
            </div>
          </div>
        </div>

        {/* Manual buttons as fallback */}
        <div className="space-y-3">
          <Button 
            onClick={onConfirm} 
            className="w-full h-12 text-lg gradient-success shadow-glow"
          >
            <Mic className="mr-2 h-4 w-4" />
            Proceed to Authenticate
          </Button>
          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="w-full h-12"
          >
            Go Back to Amount
          </Button>
        </div>
      </div>
    </div>
  );
};
