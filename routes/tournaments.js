const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');

// GET all tournaments with filtering
router.get('/', async (req, res) => {
    try {
        const { 
            search, 
            game,
            status, 
            organizerId,
            limit = 50, 
            page = 1 
        } = req.query;

        let query = {};

        // Search functionality
        if (search) {
            query.$or = [
                { tournamentName: { $regex: search, $options: 'i' } },
                { organizerName: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by game
        if (game) {
            query.game = game;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by organizer
        if (organizerId) {
            query.organizerId = organizerId;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const tournaments = await Tournament.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Tournament.countDocuments(query);

        res.json({
            success: true,
            data: tournaments,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });

    } catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tournaments',
            error: error.message
        });
    }
});

// GET single tournament by ID
router.get('/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findOne({ id: req.params.id });
        
        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found'
            });
        }

        res.json({
            success: true,
            data: tournament
        });

    } catch (error) {
        console.error('Error fetching tournament:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tournament',
            error: error.message
        });
    }
});

// POST create new tournament
router.post('/', async (req, res) => {
    try {
        const tournamentData = req.body;

        // Generate ID if not provided
        if (!tournamentData.id) {
            tournamentData.id = 'trn_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        }

        // Validate dates
        const startDate = new Date(tournamentData.startDate);
        const endDate = new Date(tournamentData.endDate);
        const regDeadline = new Date(tournamentData.registrationDeadline);

        if (startDate >= endDate) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        if (regDeadline >= startDate) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline must be before start date'
            });
        }

        const tournament = new Tournament(tournamentData);
        await tournament.save();

        res.status(201).json({
            success: true,
            message: 'Tournament created successfully',
            data: tournament
        });

    } catch (error) {
        console.error('Error creating tournament:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Tournament with this ID already exists'
            });
        }

        res.status(400).json({
            success: false,
            message: 'Error creating tournament',
            error: error.message
        });
    }
});

// PUT update tournament
router.put('/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found'
            });
        }

        res.json({
            success: true,
            message: 'Tournament updated successfully',
            data: tournament
        });

    } catch (error) {
        console.error('Error updating tournament:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating tournament',
            error: error.message
        });
    }
});

// DELETE tournament
router.delete('/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findOneAndDelete({ id: req.params.id });

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found'
            });
        }

        res.json({
            success: true,
            message: 'Tournament deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting tournament:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting tournament',
            error: error.message
        });
    }
});

// POST register participant to tournament
router.post('/:id/register', async (req, res) => {
    try {
        const tournament = await Tournament.findOne({ id: req.params.id });

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found'
            });
        }

        // Check if registration is open
        if (tournament.status !== 'registration-open') {
            return res.status(400).json({
                success: false,
                message: 'Tournament registration is closed'
            });
        }

        // Check if tournament is full
        if (tournament.currentParticipants >= tournament.maxTeams) {
            return res.status(400).json({
                success: false,
                message: 'Tournament is full'
            });
        }

        // Check registration deadline
        if (new Date() > tournament.registrationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline has passed'
            });
        }

        const { playerId, playerName, teamName } = req.body;

        // Check if player already registered
        const alreadyRegistered = tournament.participants.some(
            p => p.playerId === playerId
        );

        if (alreadyRegistered) {
            return res.status(400).json({
                success: false,
                message: 'Player already registered for this tournament'
            });
        }

        // Add participant
        tournament.participants.push({
            playerId,
            playerName,
            teamName: teamName || playerName,
            registeredAt: new Date()
        });

        tournament.currentParticipants = tournament.participants.length;
        await tournament.save();

        res.json({
            success: true,
            message: 'Successfully registered for tournament',
            data: tournament
        });

    } catch (error) {
        console.error('Error registering for tournament:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering for tournament',
            error: error.message
        });
    }
});

module.exports = router;
