import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseVoiceRecognitionProps {
  onResult?: (result: VoiceRecognitionResult) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

export const useVoiceRecognition = ({
  onResult,
  onError,
  continuous = true,
  language = 'en-IN',
}: UseVoiceRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);

  // Keep latest callbacks without reinitializing recognition
  const onResultRef = useRef<typeof onResult>(onResult);
  const onErrorRef = useRef<typeof onError>(onError);
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      onErrorRef.current?.('Speech recognition is not supported in this browser');
      return;
    }

    setIsSupported(true);
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = continuous;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = language;

    recognitionInstance.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (!result || !result[0]) return;
      const transcript = String(result[0].transcript || '');
      const confidence = Number(result[0].confidence || 0);
      const isFinal = !!result.isFinal;

      onResultRef.current?.({ transcript, confidence, isFinal });
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event?.error);
      setIsListening(false);
      onErrorRef.current?.(event?.error || 'Unknown error');
    };

    recognitionInstance.onend = () => {
      // Recognition ended (either pause between phrases or manual stop)
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      try {
        recognitionInstance.stop();
      } catch {
        // no-op
      }
    };
  }, [continuous, language]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start recognition:', error);
        onErrorRef.current?.('Failed to start listening');
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch {
        // no-op
      }
      setIsListening(false);
    }
  }, [recognition, isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
