import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface WebAudioIndicatorProps {
  isListening: boolean;
  transcript: string;
  audioLevel?: number;
}

export const WebAudioIndicator = ({ 
  isListening, 
  transcript, 
  audioLevel = 0 
}: WebAudioIndicatorProps) => {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isListening) {
      setAnimationClass('animate-pulse');
    } else {
      setAnimationClass('');
    }
  }, [isListening]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      {/* Audio Level Indicator */}
      <div className="relative">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening 
            ? 'bg-green-500 shadow-lg shadow-green-500/50' 
            : 'bg-gray-300'
        } ${animationClass}`}>
          {isListening ? (
            <Mic className="h-8 w-8 text-white" />
          ) : (
            <MicOff className="h-8 w-8 text-gray-600" />
          )}
        </div>
        
        {/* Audio Level Bars */}
        {isListening && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={`w-1 rounded-full transition-all duration-150 ${
                  audioLevel > bar * 0.2 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}
                style={{ height: `${bar * 4}px` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center">
        <h3 className={`text-lg font-semibold mb-2 ${
          isListening ? 'text-green-700' : 'text-gray-600'
        }`}>
          {isListening ? 'Listening...' : 'Web Audio Ready'}
        </h3>
        
        {transcript && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 max-w-sm">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Heard:</span> {transcript}
            </p>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          {isListening 
            ? 'Speak your command clearly' 
            : 'Click to start listening'
          }
        </p>
      </div>

      {/* Audio Level Display */}
      {isListening && (
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Audio Level</span>
            <span>{Math.round(audioLevel * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-150"
              style={{ width: `${Math.min(100, audioLevel * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
