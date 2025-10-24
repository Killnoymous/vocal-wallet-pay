import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import transactionRoutes from './routes/transactions.js';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection with authentication
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/vocal-wallet';

console.log('Attempting to connect to MongoDB...');
console.log('Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

mongoose.connect(MONGODB_URI, {
  authSource: 'admin', // Important for Docker MongoDB with authentication
  authMechanism: 'SCRAM-SHA-1'
})
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Please check:');
    console.error('1. MongoDB is running (docker-compose up or mongod)');
    console.error('2. Credentials are correct (admin:admin123)');
    console.error('3. Database name is correct (vocal-wallet)');
  });

// WebSocket connection handling
const clients = new Map();

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe' && data.userId) {
        clients.set(ws, data.userId);
        console.log(`User ${data.userId} subscribed to balance updates`);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    const userId = clients.get(ws);
    if (userId) {
      console.log(`User ${userId} disconnected`);
      clients.delete(ws);
    }
  });
});

// Broadcast balance update to specific user
export const broadcastBalanceUpdate = (userId, balance) => {
  const message = JSON.stringify({
    type: 'balance_update',
    balance: balance
  });

  clients.forEach((clientUserId, ws) => {
    if (clientUserId === userId && ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });
};

// Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export { app, server, wss };