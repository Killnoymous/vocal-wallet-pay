import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Keyboard, Send } from 'lucide-react';

interface FirefoxFallbackProps {
  onVoiceInput: (text: string) => void;
  placeholder?: string;
  title?: string;
  description?: string;
}

export const FirefoxFallback = ({
  onVoiceInput,
  placeholder = "Type your command here...",
  title = "Voice Input Not Supported",
  description = "Please type your command instead of speaking"
}: FirefoxFallbackProps) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    if (inputText.trim()) {
      onVoiceInput(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-3">
          <Keyboard className="h-6 w-6 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button 
            onClick={handleSubmit}
            disabled={!inputText.trim()}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p className="mb-2"><strong>Available commands:</strong></p>
          <ul className="space-y-1">
            <li>• "UPI ACTIVATE" - Start payment process</li>
            <li>• "scan QR" - Open QR scanner</li>
            <li>• "two hundred rupees" - Enter amount</li>
            <li>• "yes" or "no" - Confirm or cancel</li>
            <li>• "harsh" - Authentication password</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
