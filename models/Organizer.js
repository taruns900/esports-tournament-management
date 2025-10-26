const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    name: {
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
        trim: true,
        validate: {
            validator: function(v) {
                // Allow various phone number formats
                return /^[\+]?[(]?[\d\s\-\(\)]{8,}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    experience: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['approved', 'suspended'],
        default: 'approved'
    },
    verified_at: {
        type: Date,
        default: Date.now
    },
    admin_notes: {
        type: String,
        default: ''
    },
    organization_name: {
        type: String,
        trim: true,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    social_media: {
        twitter: { type: String, default: '' },
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        discord: { type: String, default: '' }
    },
    tournaments_organized: {
        type: Number,
        default: 0,
        min: 0
    },
    total_prize_pools: {
        type: Number,
        default: 0,
        min: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    rating_count: {
        type: Number,
        default: 0,
        min: 0
    },
    certificates: [{
        name: String,
        issuer: String,
        date: Date,
        file_url: String
    }],
    previous_events: [{
        name: String,
        date: Date,
        participants: Number,
        prize_pool: Number,
        game: String
    }],
    bank_details: {
        account_holder: { type: String, default: '' },
        account_number: { type: String, default: '' },
        bank_name: { type: String, default: '' },
        routing_number: { type: String, default: '' }
    },
    verification_documents: {
        id_proof: { type: String, default: '' },
        address_proof: { type: String, default: '' },
        business_license: { type: String, default: '' }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
organizerSchema.index({ email: 1 });
organizerSchema.index({ status: 1 });
organizerSchema.index({ verified_at: 1 });
organizerSchema.index({ rating: -1 });

module.exports = mongoose.model('Organizer', organizerSchema);