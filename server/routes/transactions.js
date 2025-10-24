import express from 'express';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get transactions for a user
router.get('/:userId', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new transaction
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      type,
      amount,
      payeeName,
      payeeVPA,
      transactionNote
    } = req.body;

    // Validate required fields
    if (!userId || !type || !amount) {
      return res.status(400).json({ error: 'userId, type, and amount are required' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create transaction
    const transaction = new Transaction({
      id: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
      userId,
      type,
      amount,
      payeeName,
      payeeVPA,
      timestamp: Date.now(),
      status: 'success',
      transactionNote
    });

    await transaction.save();

    // Update user balance
    if (type === 'sent') {
      user.balance -= amount;
    } else if (type === 'received') {
      user.balance += amount;
    }

    // Ensure balance doesn't go negative
    if (user.balance < 0) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await user.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction by ID
router.get('/transaction/:transactionId', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ id: req.params.transactionId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;