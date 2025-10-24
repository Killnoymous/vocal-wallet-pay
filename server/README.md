# Vocal Wallet Server

Backend server for the Vocal Wallet Pay application with MongoDB database, REST API, and WebSocket support.

## Features

- **MongoDB Integration**: User and transaction data storage
- **REST API**: Endpoints for user management and transaction history
- **WebSocket Support**: Real-time balance updates
- **User Management**: Support for multiple users with passphrases
- **Transaction Tracking**: Complete transaction history with balance updates

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your MongoDB URI
```

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Seed the database with demo users:
```bash
npm run seed
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

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
- Connect to `ws://localhost:3001`
- Send `{"type": "subscribe", "userId": "user_id"}` to subscribe to balance updates
- Receive `{"type": "balance_update", "balance": 13500}` when balance changes

## Demo Users

The database is seeded with two demo users:
- **Harsh** (passphrase: "harsh", balance: ₹13,500)
- **Tanya** (passphrase: "tanya", balance: ₹12,200)
