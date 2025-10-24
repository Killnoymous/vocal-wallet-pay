import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebAudioRecognition } from './useWebAudioRecognition';
import { createSpeechService, SpeechToTextConfig } from '../services/speechToTextService';

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

// Enhanced voice recognition with Web Audio API support for Firefox
export const useVoiceRecognition = ({
  onResult,
  onError,
  continuous = true,
  language = 'en-IN',
}: UseVoiceRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [useWebAudio, setUseWebAudio] = useState(false);
  const [userAgent, setUserAgent] = useState('');
  const [speechService, setSpeechService] = useState<any>(null);

  // Keep latest callbacks without reinitializing recognition
  const onResultRef = useRef<typeof onResult>(onResult);
  const onErrorRef = useRef<typeof onError>(onError);
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  // Detect browser and platform
  useEffect(() => {
    const ua = navigator.userAgent;
    setUserAgent(ua);
    
    // Check if it's Firefox on Raspberry Pi or similar ARM device
    const isFirefox = ua.includes('Firefox');
    const isRaspberryPi = ua.includes('arm') || ua.includes('ARM') || ua.includes('aarch64');
    const isLinux = ua.includes('Linux');
    
    console.log('Browser detection:', { isFirefox, isRaspberryPi, isLinux, userAgent: ua });
    
    // Initialize speech service
    const config: SpeechToTextConfig = {
      provider: 'local',
      language: language
    };
    setSpeechService(createSpeechService(config));
  }, [language]);

  // Web Audio API hook for Firefox compatibility
  const webAudioRecognition = useWebAudioRecognition({
    onResult: (result) => {
      console.log('Web Audio result:', result);
      onResultRef.current?.(result);
    },
    onError: (error) => {
      console.error('Web Audio error:', error);
      onErrorRef.current?.(error);
    },
    continuous,
    language
  });

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const isFirefox = userAgent.includes('Firefox');
    const isRaspberryPi = userAgent.includes('arm') || userAgent.includes('ARM') || userAgent.includes('aarch64');

    // Check for Firefox on Raspberry Pi - use Web Audio API
    if (isFirefox && (isRaspberryPi || userAgent.includes('Linux'))) {
      console.log('Firefox on Raspberry Pi detected - using Web Audio API');
      setIsSupported(true);
      setFallbackMode(false);
      setUseWebAudio(true);
      return;
    }

    if (!SpeechRecognition) {
      setIsSupported(false);
      setFallbackMode(true);
      onErrorRef.current?.('Speech recognition is not supported in this browser');
      return;
    }

    setIsSupported(true);
    setFallbackMode(false);
    setUseWebAudio(false);
    
    try {
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
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setIsSupported(false);
      setFallbackMode(true);
    }

    return () => {
      try {
        if (recognition) {
          recognition.stop();
        }
      } catch {
        // no-op
      }
    };
  }, [continuous, language, userAgent]);

  const startListening = useCallback(() => {
    if (useWebAudio) {
      // Use Web Audio API for Firefox on Raspberry Pi
      webAudioRecognition.startListening();
      setIsListening(true);
      return;
    }

    if (fallbackMode) {
      // In fallback mode, we'll use a text input approach
      setIsListening(true);
      return;
    }

    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start recognition:', error);
        onErrorRef.current?.('Failed to start listening');
      }
    }
  }, [recognition, isListening, fallbackMode, useWebAudio, webAudioRecognition]);

  const stopListening = useCallback(() => {
    if (useWebAudio) {
      webAudioRecognition.stopListening();
      setIsListening(false);
      return;
    }

    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch {
        // no-op
      }
    }
    setIsListening(false);
  }, [recognition, isListening, useWebAudio, webAudioRecognition]);

  // Fallback method for text input
  const simulateVoiceInput = useCallback((text: string) => {
    if (fallbackMode && onResultRef.current) {
      onResultRef.current({
        transcript: text,
        confidence: 0.9,
        isFinal: true
      });
    }
  }, [fallbackMode]);

  return {
    isListening: useWebAudio ? webAudioRecognition.isListening : isListening,
    isSupported: useWebAudio ? webAudioRecognition.isSupported : isSupported,
    fallbackMode,
    useWebAudio,
    startListening,
    stopListening,
    simulateVoiceInput, // For fallback mode
  };
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}