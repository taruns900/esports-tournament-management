const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 13,
        max: 99
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'banned'],
        default: 'active'
    },
    tournaments_participated: {
        type: Number,
        default: 0,
        min: 0
    },
    tournaments_won: {
        type: Number,
        default: 0,
        min: 0
    },
    total_earnings: {
        type: Number,
        default: 0,
        min: 0
    },
    tournament_history: [{
        tournamentId: String,
        tournamentName: String,
        position: Number,
        prize: Number,
        date: Date
    }]
}, {
    timestamps: true
});

// Wallet balance for player (in minor currency units or base currency)
playerSchema.add({
    walletBalance: {
        type: Number,
        default: 0,
        min: 0
    }
});

// Helper method to adjust wallet atomically
playerSchema.methods.adjustWallet = async function(amount) {
    // amount can be positive (deposit) or negative (deduction)
    const newBalance = this.walletBalance + amount;
    if (newBalance < 0) {
        throw new Error('Insufficient wallet balance');
    }
    this.walletBalance = newBalance;
    await this.save();
    return this.walletBalance;
};

// Indexes for better query performance
playerSchema.index({ email: 1 });
playerSchema.index({ status: 1 });
playerSchema.index({ country: 1 });

// Virtual for full name
playerSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Player', playerSchema);
