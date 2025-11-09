const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (your existing frontend)
app.use(express.static('.'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/esports_tournament_db';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    console.log('🔍 You can now use MongoDB Compass to view your data at:', MONGODB_URI);
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

// Import routes
const organizerRoutes = require('./routes/organizers');
const tournamentRoutes = require('./routes/tournaments');
const playerRoutes = require('./routes/players');
const walletRoutes = require('./routes/wallet');

// API Routes
app.use('/tables/organizers', organizerRoutes);
app.use('/tables/tournaments', tournamentRoutes);
app.use('/tables/players', playerRoutes);
app.use('/wallet', walletRoutes);

// Serve the main HTML file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the tournament creation page
app.get('/create-tournament', (req, res) => {
    res.sendFile(path.join(__dirname, 'create-tournament.html'));
});

// Serve the player registration page
app.get('/player-registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'player-registration.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running', 
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Graceful port binding with automatic fallback if port is busy
function startServer(targetPort, attempt = 1, maxAttempts = 10) {
    const server = app.listen(targetPort, () => {
        console.log(`🚀 Server running on http://localhost:${targetPort}`);
        console.log(`📊 MongoDB Compass Connection: ${MONGODB_URI}`);
        console.log(`🌐 Frontend available at: http://localhost:${targetPort}`);
        if (attempt > 1) {
            console.log(`✅ Fallback succeeded on port ${targetPort} (original requested port: ${PORT})`);
        }
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${targetPort} is already in use.`);
            if (attempt < maxAttempts) {
                const nextPort = targetPort + 1;
                console.log(`🔄 Attempting to use next port: ${nextPort} (attempt ${attempt + 1}/${maxAttempts})`);
                startServer(nextPort, attempt + 1, maxAttempts);
            } else {
                console.error('⚠️ Max attempts reached. Could not bind to a free port. Please free a port and retry.');
                process.exit(1);
            }
        } else {
            console.error('🚨 Server failed to start:', err);
            process.exit(1);
        }
    });
}

// Start with requested PORT env (defaults to 3000) and auto-fallback if needed
const requestedPort = parseInt(PORT, 10) || 3000;
startServer(requestedPort);

module.exports = app;