# Firefox Compatibility for Raspberry Pi 5

This document explains the Firefox compatibility implementation for the Vocal Wallet Pay application on Raspberry Pi 5.

## Problem

The Web Speech API has limited support in Mozilla Firefox, especially on ARM-based systems like Raspberry Pi 5. This causes the voice recognition features to fail.

## Solution

We've implemented a comprehensive fallback system that automatically detects Firefox on Raspberry Pi and switches to text input mode.

## Features

### 🔍 Automatic Detection
- Detects Firefox browser
- Identifies Raspberry Pi 5 (ARM architecture)
- Automatically switches to fallback mode

### 📝 Text Input Fallback
- Replaces voice commands with text input
- Same functionality as voice commands
- User-friendly interface with clear instructions

### 🎯 Supported Commands
All voice commands work in text mode:
- `"UPI ACTIVATE"` - Start payment process
- `"scan QR"` - Open QR scanner
- `"two hundred rupees"` - Enter amount
- `"yes"` / `"no"` - Confirm or cancel
- `"harsh"` - Authentication password

## Implementation Details

### Browser Detection
```typescript
const isFirefox = userAgent.includes('Firefox');
const isRaspberryPi = userAgent.includes('arm') || userAgent.includes('ARM');
const fallbackMode = isFirefox && isRaspberryPi;
```

### Fallback Components
- `FirefoxFallback.tsx` - Text input interface
- `BrowserDetection.tsx` - Shows compatibility status
- Updated `useVoiceRecognition.ts` - Handles fallback mode

### UI Adaptations
- Dynamic text/voice instructions
- Fallback input fields
- Visual indicators for compatibility mode

## Usage on Raspberry Pi 5

1. **Open Firefox** on Raspberry Pi 5
2. **Navigate** to the application
3. **See detection notice** (if applicable)
4. **Use text input** instead of voice commands
5. **Same workflow** as voice version

## Browser Support Matrix

| Browser | Platform | Voice Support | Fallback Mode |
|---------|----------|---------------|---------------|
| Chrome | Any | ✅ Yes | ❌ No |
| Firefox | Windows/Mac | ✅ Yes | ❌ No |
| Firefox | Raspberry Pi | ❌ No | ✅ Yes |
| Safari | Any | ✅ Yes | ❌ No |

## Technical Notes

### Why Firefox on Raspberry Pi?
- Limited Web Speech API support
- ARM architecture compatibility issues
- Different audio processing on Linux

### Fallback Implementation
- Seamless user experience
- No functionality loss
- Automatic detection and switching
- Clear user guidance

## Testing

To test the fallback mode:
1. Use Firefox on Raspberry Pi 5
2. Check for browser detection notice
3. Verify text input works
4. Test all payment flows

## Future Improvements

- WebRTC audio capture as alternative
- Offline speech recognition
- Custom audio processing
- Better ARM optimization

## Troubleshooting

### If fallback doesn't activate:
1. Check browser user agent
2. Verify ARM detection
3. Clear browser cache
4. Check console for errors

### If text input doesn't work:
1. Verify component rendering
2. Check event handlers
3. Test input validation
4. Review command parsing
