const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    tournamentName: {
        type: String,
        required: true,
        trim: true
    },
    organizerId: {
        type: String,
        required: true,
        ref: 'Organizer'
    },
    organizerName: {
        type: String,
        required: true
    },
    game: {
        type: String,
        required: true,
        enum: ['pubg', 'valorant', 'cod']
    },
    mode: {
        type: String,
        required: true,
        enum: ['solo', 'duo', 'squad']
    },
    format: {
        type: String,
        required: true,
        enum: ['battle-royale', 'single-elimination', 'double-elimination', 'round-robin', 'swiss']
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    registrationDeadline: {
        type: Date,
        required: true
    },
    maxTeams: {
        type: Number,
        required: true,
        min: 2
    },
    currentParticipants: {
        type: Number,
        default: 0
    },
    prizePool: {
        type: Number,
        required: true,
        min: 1000
    },
    prizeDistribution: {
        type: String,
        default: '60-30-10'
    },
    hasEntryFee: {
        type: Boolean,
        default: false
    },
    entryFee: {
        type: Number,
        default: 0
    },
    minAge: {
        type: Number,
        required: true,
        min: 13
    },
    minRank: {
        type: String,
        default: ''
    },
    region: {
        type: String,
        default: 'global'
    },
    server: {
        type: String,
        default: ''
    },
    numberOfMatches: {
        type: Number,
        required: true,
        min: 1
    },
    rules: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    streamUrl: {
        type: String,
        default: ''
    },
    discordUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['upcoming', 'registration-open', 'registration-closed', 'ongoing', 'completed', 'cancelled'],
        default: 'registration-open'
    },
    participants: [{
        playerId: String,
        playerName: String,
        teamName: String,
        registeredAt: {
            type: Date,
            default: Date.now
        }
    }],
    winners: [{
        position: Number,
        playerId: String,
        playerName: String,
        teamName: String,
        prize: Number
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
tournamentSchema.index({ game: 1 });
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ startDate: 1 });
tournamentSchema.index({ organizerId: 1 });
tournamentSchema.index({ registrationDeadline: 1 });

module.exports = mongoose.model('Tournament', tournamentSchema);
