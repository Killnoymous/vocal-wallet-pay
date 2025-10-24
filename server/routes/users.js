import express from 'express';
import User from '../models/User.js';
import { broadcastBalanceUpdate } from '../index.js';

const router = express.Router();

// Get user by name (for demo purposes)
router.get('/:name', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      balance: user.balance,
      passphrase: user.passphrase
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user balance
router.patch('/:name/balance', async (req, res) => {
  try {
    const { amount, type } = req.body;
    
    if (!amount || !type) {
      return res.status(400).json({ error: 'Amount and type are required' });
    }

    const user = await User.findOne({ name: req.params.name });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update balance based on transaction type
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

    // Broadcast balance update via WebSocket
    broadcastBalanceUpdate(user._id.toString(), user.balance);

    res.json({
      id: user._id,
      name: user.name,
      balance: user.balance
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user balance directly (for manual database updates)
router.put('/:name/balance', async (req, res) => {
  try {
    const { balance } = req.body;
    
    if (typeof balance !== 'number' || balance < 0) {
      return res.status(400).json({ error: 'Valid balance amount is required' });
    }

    const user = await User.findOne({ name: req.params.name });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.balance = balance;
    await user.save();

    // Broadcast balance update via WebSocket
    broadcastBalanceUpdate(user._id.toString(), user.balance);

    res.json({
      id: user._id,
      name: user.name,
      balance: user.balance
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate passphrase
router.post('/:name/validate', async (req, res) => {
  try {
    const { passphrase } = req.body;
    
    if (!passphrase) {
      return res.status(400).json({ error: 'Passphrase is required' });
    }

    const user = await User.findOne({ name: req.params.name });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = user.passphrase.toLowerCase() === passphrase.toLowerCase();
    
    res.json({ valid: isValid });
  } catch (error) {
    console.error('Error validating passphrase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;