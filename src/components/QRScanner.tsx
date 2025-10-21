import { useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQRScanner } from '@/hooks/useQRScanner';

interface QRScannerProps {
  onScanComplete: (data: string) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScanComplete, onClose }: QRScannerProps) => {
  const { isScanning, error, result, startScanning, stopScanning, videoRef, canvasRef } = useQRScanner();

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, [startScanning, stopScanning]);

  useEffect(() => {
    if (result) {
      onScanComplete(result.data);
    }
  }, [result, onScanComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Scan QR Code</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="relative glass-card rounded-2xl overflow-hidden shadow-card">
            {error ? (
              <div className="aspect-square flex items-center justify-center p-8">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={startScanning}>Try Again</Button>
                </div>
              </div>
            ) : (
              <div className="relative aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scan guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-64 h-64">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  </div>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-sm text-foreground/80 bg-background/80 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
                  Position QR code within frame
                </p>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Align the QR code within the frame to scan
          </p>
        </div>
      </div>
    </div>
  );
};
