import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['sent', 'received'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  payeeName: {
    type: String
  },
  payeeVPA: {
    type: String
  },
  timestamp: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  transactionNote: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model('Transaction', transactionSchema);