const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// GET all players with optional filtering
router.get('/', async (req, res) => {
    try {
        const { 
            search, 
            status,
            country,
            limit = 50, 
            page = 1 
        } = req.query;

        let query = {};

        // Search functionality
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by country
        if (country) {
            query.country = country;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const players = await Player.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .select('-__v'); // Exclude version key

        const total = await Player.countDocuments(query);

        res.json({
            success: true,
            data: players,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });

    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching players',
            error: error.message
        });
    }
});

// GET single player by ID
router.get('/:id', async (req, res) => {
    try {
        const player = await Player.findOne({ id: req.params.id });
        
        if (!player) {
            return res.status(404).json({
                success: false,
                message: 'Player not found'
            });
        }

        res.json({
            success: true,
            data: player
        });

    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching player',
            error: error.message
        });
    }
});

// POST create new player
router.post('/', async (req, res) => {
    try {
        console.log('📝 Received player registration request');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const playerData = req.body;

        // Generate ID if not provided
        if (!playerData.id) {
            playerData.id = 'plr_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        }
        
        console.log('Generated player ID:', playerData.id);

        // Check if email already exists
        const existingPlayer = await Player.findOne({ email: playerData.email });
        if (existingPlayer) {
            console.log('❌ Email already registered:', playerData.email);
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        console.log('💾 Saving player to MongoDB...');
        
        const player = new Player(playerData);
        await player.save();
        
        console.log('✅ Player registered successfully!');
        console.log('Player details:', {
            id: player.id,
            name: player.firstName + ' ' + player.lastName,
            email: player.email
        });

        res.status(201).json({
            success: true,
            message: 'Player registered successfully',
            data: player
        });

    } catch (error) {
        console.error('Error registering player:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Player with this email already exists'
            });
        }

        res.status(400).json({
            success: false,
            message: 'Error registering player',
            error: error.message
        });
    }
});

// PUT update player
router.put('/:id', async (req, res) => {
    try {
        const player = await Player.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!player) {
            return res.status(404).json({
                success: false,
                message: 'Player not found'
            });
        }

        res.json({
            success: true,
            message: 'Player updated successfully',
            data: player
        });

    } catch (error) {
        console.error('Error updating player:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating player',
            error: error.message
        });
    }
});

// DELETE player
router.delete('/:id', async (req, res) => {
    try {
        const player = await Player.findOneAndDelete({ id: req.params.id });

        if (!player) {
            return res.status(404).json({
                success: false,
                message: 'Player not found'
            });
        }

        res.json({
            success: true,
            message: 'Player deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting player',
            error: error.message
        });
    }
});

// GET player statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const stats = await Player.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await Player.countDocuments();
        const active = await Player.countDocuments({ status: 'active' });
        const byCountry = await Player.aggregate([
            {
                $group: {
                    _id: '$country',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                total,
                active,
                breakdown: stats,
                topCountries: byCountry
            }
        });

    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching player stats',
            error: error.message
        });
    }
});

module.exports = router;
