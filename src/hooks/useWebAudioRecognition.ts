import { useState, useEffect, useCallback, useRef } from 'react';

interface AudioRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseWebAudioRecognitionProps {
  onResult?: (result: AudioRecognitionResult) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

export const useWebAudioRecognition = ({
  onResult,
  onError,
  continuous = true,
  language = 'en-IN',
}: UseWebAudioRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [processor, setProcessor] = useState<ScriptProcessorNode | null>(null);
  
  const audioDataRef = useRef<Float32Array[]>([]);
  const isProcessingRef = useRef(false);

  // Keep latest callbacks without reinitializing
  const onResultRef = useRef<typeof onResult>(onResult);
  const onErrorRef = useRef<typeof onError>(onError);
  
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  // Initialize Web Audio API
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Check for Web Audio API support
        if (!window.AudioContext && !(window as any).webkitAudioContext) {
          setIsSupported(false);
          onErrorRef.current?.('Web Audio API not supported');
          return;
        }

        // Check for getUserMedia support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsSupported(false);
          onErrorRef.current?.('getUserMedia not supported');
          return;
        }

        setIsSupported(true);
        console.log('Web Audio API supported, initializing...');
      } catch (error) {
        console.error('Audio initialization failed:', error);
        setIsSupported(false);
        onErrorRef.current?.('Failed to initialize audio');
      }
    };

    initializeAudio();
  }, []);

  // Process audio data and send to speech recognition service
  const processAudioData = useCallback(async (audioData: Float32Array) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      // Convert Float32Array to base64 for API
      const audioBuffer = audioData.buffer.slice(
        audioData.byteOffset,
        audioData.byteOffset + audioData.byteLength
      );
      
      // For now, we'll simulate speech recognition
      // In a real implementation, you would send this to a speech-to-text service
      const simulatedTranscript = await simulateSpeechRecognition(audioData);
      
      if (simulatedTranscript) {
        onResultRef.current?.({
          transcript: simulatedTranscript,
          confidence: 0.8,
          isFinal: true
        });
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      onErrorRef.current?.('Failed to process audio');
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // Simulate speech recognition (replace with actual service)
  const simulateSpeechRecognition = async (audioData: Float32Array): Promise<string | null> => {
    // This is a placeholder - in a real implementation, you would:
    // 1. Send audio data to a speech-to-text service (Google Cloud Speech, Azure, etc.)
    // 2. Use Web Speech API if available
    // 3. Use a local speech recognition library
    
    // For demonstration, we'll use a simple keyword detection
    const audioLevel = calculateAudioLevel(audioData);
    
    if (audioLevel > 0.1) { // If there's significant audio
      // Simulate some common voice commands
      const commands = [
        'UPI ACTIVATE',
        'scan QR',
        'two hundred rupees',
        'yes',
        'no',
        'harsh',
        'cancel'
      ];
      
      // Return a random command for testing
      // In real implementation, this would be the actual recognized text
      return commands[Math.floor(Math.random() * commands.length)];
    }
    
    return null;
  };

  // Calculate audio level for voice activity detection
  const calculateAudioLevel = (audioData: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += Math.abs(audioData[i]);
    }
    return sum / audioData.length;
  };

  const startListening = useCallback(async () => {
    if (!isSupported || isListening) return;

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      setMediaStream(stream);

      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContextClass();
      setAudioContext(context);

      // Create audio source
      const source = context.createMediaStreamSource(stream);
      
      // Create script processor for audio processing
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
      setProcessor(scriptProcessor);

      scriptProcessor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Store audio data
        audioDataRef.current.push(new Float32Array(inputData));
        
        // Process audio in chunks
        if (audioDataRef.current.length >= 4) { // Process every 4 chunks
          const combinedData = new Float32Array(audioDataRef.current.length * audioDataRef.current[0].length);
          let offset = 0;
          for (const chunk of audioDataRef.current) {
            combinedData.set(chunk, offset);
            offset += chunk.length;
          }
          
          processAudioData(combinedData);
          audioDataRef.current = [];
        }
      };

      // Connect audio nodes
      source.connect(scriptProcessor);
      scriptProcessor.connect(context.destination);

      setIsListening(true);
      console.log('Web Audio listening started');
      
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      onErrorRef.current?.('Failed to access microphone');
    }
  }, [isSupported, isListening, processAudioData]);

  const stopListening = useCallback(() => {
    if (processor) {
      processor.disconnect();
      setProcessor(null);
    }

    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }

    audioDataRef.current = [];
    setIsListening(false);
    console.log('Web Audio listening stopped');
  }, [processor, audioContext, mediaStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
};

declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}
