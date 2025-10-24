import { useEffect, useState } from 'react';
import { Monitor, Smartphone, AlertTriangle } from 'lucide-react';

export const BrowserDetection = () => {
  const [browserInfo, setBrowserInfo] = useState({
    userAgent: '',
    isFirefox: false,
    isRaspberryPi: false,
    isLinux: false,
    fallbackMode: false
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    const isFirefox = ua.includes('Firefox');
    const isRaspberryPi = ua.includes('arm') || ua.includes('ARM') || ua.includes('aarch64');
    const isLinux = ua.includes('Linux');
    const fallbackMode = isFirefox && (isRaspberryPi || isLinux);

    setBrowserInfo({
      userAgent: ua,
      isFirefox,
      isRaspberryPi,
      isLinux,
      fallbackMode
    });
  }, []);

  if (!browserInfo.fallbackMode) {
    return null; // Don't show if not in fallback mode
  }

  return (
    <div className="glass-card rounded-xl p-4 mb-4 border-orange-200 bg-orange-50">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <div>
          <h4 className="font-semibold text-orange-800">Firefox on Raspberry Pi Detected</h4>
          <p className="text-sm text-orange-700">
            Voice recognition not supported. Using text input mode.
          </p>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-orange-600">
        <p><strong>Browser:</strong> Firefox</p>
        <p><strong>Platform:</strong> {browserInfo.isRaspberryPi ? 'Raspberry Pi' : 'Linux'}</p>
        <p><strong>Mode:</strong> Text Input Fallback</p>
      </div>
    </div>
  );
};
