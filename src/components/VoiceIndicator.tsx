import { Mic, MicOff } from 'lucide-react';

interface VoiceIndicatorProps {
  isListening: boolean;
  transcript?: string;
}

export const VoiceIndicator = ({ isListening, transcript }: VoiceIndicatorProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${isListening ? 'animate-pulse-ring' : ''}`}>
        <div className="absolute inset-0 rounded-full gradient-primary opacity-30 blur-xl" />
        <div className="relative glass-card rounded-full p-6 shadow-glow">
          {isListening ? (
            <Mic className="h-12 w-12 text-primary-foreground" />
          ) : (
            <MicOff className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
      </div>

      {isListening && (
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-1 h-8 bg-primary rounded-full animate-wave"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {transcript && (
        <div className="glass-card rounded-lg p-4 max-w-md shadow-card">
          <p className="text-sm text-muted-foreground mb-1">You said:</p>
          <p className="text-foreground">{transcript}</p>
        </div>
      )}
    </div>
  );
};
