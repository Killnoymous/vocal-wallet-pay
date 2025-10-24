# Vocal Wallet Pay

A voice-powered UPI payment application with real-time balance updates, QR code scanning, and transaction history. Built with React, Express, MongoDB, and WebSocket support.

## Features

- 🎤 **Voice Commands**: Activate UPI scanner, enter amounts, and authenticate payments
- 📱 **QR Code Scanning**: Scan UPI QR codes for instant payment setup
- 💰 **Real-time Balance**: Live balance updates via WebSocket
- 📊 **Transaction History**: Complete payment history with search and filtering
- 🔐 **Voice Authentication**: Secure payment confirmation using voice passphrases
- 🗄️ **Database Integration**: MongoDB for persistent data storage

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui components
- React Query for data fetching
- WebSocket for real-time updates

### Backend
- Express.js server
- MongoDB with Mongoose ODM
- WebSocket support for real-time updates
- RESTful API endpoints
- CORS enabled for cross-origin requests

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (Docker or local installation)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd vocal-wallet-pay

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

2. **Set up MongoDB:**
```bash
# Option 1: Using Docker (Recommended)
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  --name vocal-wallet-mongo \
  mongo

# Option 2: Local MongoDB
brew services start mongodb-community
```

3. **Seed the database:**
```bash
cd server
MONGODB_URI=mongodb://admin:admin123@localhost:27017/vocal-wallet npm run seed
cd ..
```

4. **Start development servers:**
```bash
# Option 1: Use the convenience script
./start-dev.sh

# Option 2: Start manually
# Terminal 1 - Backend
cd server
MONGODB_URI=mongodb://admin:admin123@localhost:27017/vocal-wallet npm run dev

# Terminal 2 - Frontend
npm run dev
```

5. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3001

## Demo Users

The application comes with two pre-seeded demo users:

- **Harsh** (passphrase: "harsh", balance: ₹13,500)
- **Tanya** (passphrase: "tanya", balance: ₹12,200)

## Usage

### Voice Commands
- Say **"UPI ACTIVATE"** to start the payment process
- Say **"scan QR"** to open the QR scanner directly
- Say the amount when prompted (e.g., "two hundred rupees")
- Say **"Harsh"** to authenticate payments (demo passphrase)
- Say **"cancel"** to cancel any operation

### Payment Flow
1. **Activate**: Say "UPI ACTIVATE" or click "Scan QR Code"
2. **Scan**: Point camera at UPI QR code
3. **Amount**: Say the payment amount (if not in QR)
4. **Confirm**: Review payment details
5. **Authenticate**: Say your passphrase ("Harsh" for demo)
6. **Success**: Payment processed and balance updated

## API Endpoints

### Users
- `GET /api/users/:name` - Get user by name
- `PATCH /api/users/:name/balance` - Update user balance
- `POST /api/users/:name/validate` - Validate user passphrase

### Transactions
- `GET /api/transactions/:userId` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/transaction/:transactionId` - Get transaction by ID

### WebSocket
Connect to `ws://localhost:3001` and send:
```json
{"type": "subscribe", "userId": "user_id"}
```

Receive real-time balance updates:
```json
{"type": "balance_update", "balance": 13500}
```

## Project Structure

```
vocal-wallet-pay/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and API service
│   └── pages/             # Page components
├── server/                # Backend Express server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── scripts/           # Database seeding
│   └── index.js          # Server entry point
└── README.md
```

## Development

### Frontend Development
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
cd server
MONGODB_URI=mongodb://admin:admin123@localhost:27017/vocal-wallet npm run dev
MONGODB_URI=mongodb://admin:admin123@localhost:27017/vocal-wallet npm start
MONGODB_URI=mongodb://admin:admin123@localhost:27017/vocal-wallet npm run seed
```

### Database Management
```bash
# Connect to MongoDB
mongosh mongodb://admin:admin123@localhost:27017/vocal-wallet

# View collections
show collections

# View users
db.users.find()

# View transactions
db.transactions.find()
```

## Environment Variables

The server uses the following environment variables:
- `MONGODB_URI`: MongoDB connection string (default: mongodb://admin:admin123@localhost:27017/vocal-wallet)
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `docker ps` or `brew services list | grep mongo`
   - Check credentials: admin:admin123
   - Verify connection string format

2. **WebSocket Connection Failed**
   - Verify backend server is running on port 3001
   - Check browser console for connection errors

3. **Voice Recognition Not Working**
   - Ensure microphone permissions are granted
   - Try refreshing the page
   - Check browser compatibility (Chrome recommended)

4. **QR Scanner Not Working**
   - Ensure camera permissions are granted
   - Use HTTPS in production (required for camera access)

### Debug Mode
Enable debug logging by opening browser console and checking for:
- API request/response logs
- WebSocket connection status
- Voice recognition results

## Production Deployment

### Frontend
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend
```bash
cd server
MONGODB_URI=your_production_mongodb_uri npm start
# Deploy to your server with PM2 or similar
```

### Environment Setup
- Set production MongoDB URI
- Configure CORS for your domain
- Set up SSL certificates for HTTPS
- Configure WebSocket proxy if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.