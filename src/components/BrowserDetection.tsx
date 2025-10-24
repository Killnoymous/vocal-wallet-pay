import { useEffect, useState } from 'react';
import { Monitor, Smartphone, AlertTriangle } from 'lucide-react';

export const BrowserDetection = () => {
  const [browserInfo, setBrowserInfo] = useState({
    userAgent: '',
    isFirefox: false,
    isRaspberryPi: false,
    isLinux: false,
    useWebAudio: false,
    fallbackMode: false
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    const isFirefox = ua.includes('Firefox');
    const isRaspberryPi = ua.includes('arm') || ua.includes('ARM') || ua.includes('aarch64');
    const isLinux = ua.includes('Linux');
    const useWebAudio = isFirefox && (isRaspberryPi || isLinux);
    const fallbackMode = !useWebAudio && !(window as any).SpeechRecognition && !(window as any).webkitSpeechRecognition;

    setBrowserInfo({
      userAgent: ua,
      isFirefox,
      isRaspberryPi,
      isLinux,
      useWebAudio,
      fallbackMode
    });
  }, []);

  if (!browserInfo.useWebAudio && !browserInfo.fallbackMode) {
    return null; // Don't show if using standard speech recognition
  }

  return (
    <div className={`glass-card rounded-xl p-4 mb-4 ${
      browserInfo.useWebAudio 
        ? 'border-blue-200 bg-blue-50' 
        : 'border-orange-200 bg-orange-50'
    }`}>
      <div className="flex items-center gap-3">
        {browserInfo.useWebAudio ? (
          <Monitor className="h-5 w-5 text-blue-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-orange-600" />
        )}
        <div>
          <h4 className={`font-semibold ${
            browserInfo.useWebAudio ? 'text-blue-800' : 'text-orange-800'
          }`}>
            {browserInfo.useWebAudio ? 'Firefox on Raspberry Pi Detected' : 'Voice Recognition Not Supported'}
          </h4>
          <p className={`text-sm ${
            browserInfo.useWebAudio ? 'text-blue-700' : 'text-orange-700'
          }`}>
            {browserInfo.useWebAudio 
              ? 'Using Web Audio API for voice recognition.' 
              : 'Using text input mode.'}
          </p>
        </div>
      </div>
      
      <div className={`mt-3 text-xs ${
        browserInfo.useWebAudio ? 'text-blue-600' : 'text-orange-600'
      }`}>
        <p><strong>Browser:</strong> Firefox</p>
        <p><strong>Platform:</strong> {browserInfo.isRaspberryPi ? 'Raspberry Pi' : 'Linux'}</p>
        <p><strong>Mode:</strong> {browserInfo.useWebAudio ? 'Web Audio API' : 'Text Input Fallback'}</p>
      </div>
    </div>
  );
};
