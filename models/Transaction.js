const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userType: { type: String, enum: ['player', 'organizer'], required: true },
  // Added 'fee-credit' to support organizer credits from player entry fees
  type: { type: String, enum: ['deposit', 'deduct', 'lock', 'release', 'withdraw', 'fee-credit'], required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  reference: { type: String, default: '' },
  meta: { type: Object, default: {} }
}, { timestamps: true });

transactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
