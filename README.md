# 🎙️ UPI Voice Wallet — Voice-Powered UPI Payments

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-black?style=flat-square)](https://ui.shadcn.com/)

A premium, interactive voice-driven UPI QR payment application designed for hands-free and accessible payment experiences. By leveraging the Web Speech API (Speech Recognition and Speech Synthesis), users can scan codes, confirm details, and execute transactions using natural voice commands.

---

## 🌟 Key Features

*   **🎙️ Hands-Free Voice Control**: Complete transactions entirely through voice commands (e.g., "pay", "cancel", "confirm").
*   **📷 Live QR Code Scanner**: Scan standard UPI QR codes using your device's camera with real-time decoding via `jsQR`.
*   **🗣️ Interactive Voice UI/UX**: Text-to-speech audio guidance alongside dynamic visual indicators (voice wave animations, status prompts).
*   **💰 Demo Wallet & Balance**: Includes pre-funded demo balance, transaction history, and custom wallet top-ups.
*   **🦊 Browser Compatibility Fallbacks**: Dedicated compatibility system to detect unsupported Speech Recognition browsers (like Firefox) and provide fully functional manual/semi-voice alternatives.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) and `npm` or `bun` installed.

### Installation & Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AnmolGarg8/vocal-wallet-pay.git
    cd vocal-wallet-pay
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or using bun
    bun install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or using bun
    bun dev
    ```

4.  **Open the app:**
    Navigate to `http://localhost:5173` (or the port specified in your terminal).

---

## 📂 Codebase Architecture

```text
src/
├── components/          # Reusable UI Components
│   ├── ui/              # shadcn UI components (button, dialog, card, etc.)
│   ├── BrowserDetection # Detects browser compatibility for Speech APIs
│   ├── FirefoxFallback  # Alternative flows for unsupported environments
│   ├── PaymentConfirmation # Interactive confirmation voice/visual flow
│   ├── PaymentSuccess   # Success animations and final receipt
│   ├── QRScanner        # Camera scanner interface using jsqr
│   ├── TransactionHistory # Visual logs of past mock transactions
│   ├── VoiceIndicator   # Visualizing voice input states (waves/listening)
│   └── WebAudioIndicator # Fallback sound and audio alerts
├── hooks/               # Custom React Hooks
├── pages/               # Page Components (Index dashboard, NotFound)
├── services/            # Core business logic and integrations
│   └── speechToTextService # Web Speech API wrapper and fallback handler
├── App.tsx              # Main routing & application wrapper
└── index.css            # Tailwind directives and custom variables
```

---

## 🎙️ Voice Flow & Commands

When making a payment, the application prompts you at key stages:

1.  **Scanner Stage**: Say *"Scan"* to launch or reactivate the camera scanner (or tap the button).
2.  **Confirmation Stage**: Once a QR is scanned, the app will speak the recipient and amount.
    *   Say *"Pay"* or *"Confirm"* to execute the payment.
    *   Say *"Cancel"* or *"Go back"* to abort.
3.  **Top-up Stage**: When on the dashboard, you can speak top-up commands to add mock balance.

---

## 🔧 Deployment

To deploy this project to static hosting services like Vercel, Netlify, or GitHub Pages:

```bash
# Build the production bundle
npm run build

# Preview the production build locally
npm run preview
```

