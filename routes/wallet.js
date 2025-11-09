const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Organizer = require('../models/Organizer');
const Transaction = require('../models/Transaction');

function genId(prefix='txn_') {
  return prefix + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

// POST /wallet/deposit
router.post('/deposit', async (req, res) => {
  try {
    const { userId, userType, amount } = req.body;
    const amt = parseInt(amount, 10);
    if (!userId || !userType || isNaN(amt) || amt <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    let user;
    if (userType === 'player') {
      user = await Player.findOne({ id: userId });
    } else if (userType === 'organizer') {
      user = await Organizer.findOne({ id: userId });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user type' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.walletBalance = (user.walletBalance || 0) + amt;
    await user.save();

    const txn = await Transaction.create({
      id: genId(),
      userId,
      userType,
      type: 'deposit',
      amount: amt,
      reference: 'manual_deposit'
    });

    res.json({ success: true, message: 'Deposited successfully', balance: user.walletBalance, transaction: txn });
  } catch (err) {
    console.error('Wallet deposit error:', err);
    res.status(500).json({ success: false, message: 'Internal error', error: err.message });
  }
});

// POST /wallet/withdraw
router.post('/withdraw', async (req, res) => {
  try {
    const { userId, userType, amount } = req.body;
    const amt = parseInt(amount, 10);
    if (!userId || !userType || isNaN(amt) || amt <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    let user;
    if (userType === 'player') {
      user = await Player.findOne({ id: userId });
    } else if (userType === 'organizer') {
      user = await Organizer.findOne({ id: userId });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user type' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if ((user.walletBalance || 0) < amt) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    user.walletBalance = (user.walletBalance || 0) - amt;
    await user.save();

    const txn = await Transaction.create({
      id: genId(),
      userId,
      userType,
      type: 'withdraw',
      amount: amt,
      reference: 'manual_withdraw'
    });

    res.json({ success: true, message: 'Withdrawn successfully', balance: user.walletBalance, transaction: txn });
  } catch (err) {
    console.error('Wallet withdraw error:', err);
    res.status(500).json({ success: false, message: 'Internal error', error: err.message });
  }
});

// GET /wallet/transactions?userId=...&userType=...
router.get('/transactions', async (req, res) => {
  try {
    const { userId, userType, limit = 50 } = req.query;
    if (!userId || !userType) {
      return res.status(400).json({ success: false, message: 'Missing userId or userType' });
    }
    const txns = await Transaction.find({ userId, userType }).sort({ createdAt: -1 }).limit(parseInt(limit, 10));
    res.json({ success: true, data: txns });
  } catch (err) {
    console.error('Fetch transactions error:', err);
    res.status(500).json({ success: false, message: 'Internal error', error: err.message });
  }
});

module.exports = router;
