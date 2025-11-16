const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Organizer = require('../models/Organizer');
const Player = require('../models/Player');
const Transaction = require('../models/Transaction');
function genId(prefix='txn_'){return prefix+Math.random().toString(36).slice(2,9)+Date.now().toString(36)}

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
        console.log('📝 Received tournament creation request');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const tournamentData = req.body;

        // Generate ID if not provided
        if (!tournamentData.id) {
            tournamentData.id = 'trn_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        }
        
        console.log('Generated tournament ID:', tournamentData.id);

        // Validate dates
        const startDate = new Date(tournamentData.startDate);
        const endDate = tournamentData.endDate ? new Date(tournamentData.endDate) : null;
        const regDeadline = new Date(tournamentData.registrationDeadline);

        // If endDate provided, validate it; otherwise allow it to be omitted
        if (endDate && startDate > endDate) {
            console.log('❌ Validation failed: End date must be on/after start date');
            return res.status(400).json({
                success: false,
                message: 'End date must be on/after start date'
            });
        }

        if (regDeadline >= startDate) {
            console.log('❌ Validation failed: Registration deadline must be before start date');
            return res.status(400).json({
                success: false,
                message: 'Registration deadline must be before start date'
            });
        }

        console.log('✅ Date validation passed');

        // If endDate is not provided, set it equal to startDate for compatibility
        if (!tournamentData.endDate) {
            tournamentData.endDate = tournamentData.startDate;
        }

        // Enforce organizer wallet has enough to cover prizePool
        const organizer = await Organizer.findOne({ id: tournamentData.organizerId });
        if (!organizer) {
            return res.status(400).json({ success: false, message: 'Organizer not found' });
        }
        const prize = parseInt(tournamentData.prizePool, 10) || 0;
        if ((organizer.walletBalance || 0) < prize) {
            return res.status(400).json({ success: false, message: 'Insufficient organizer wallet balance to cover prize pool' });
        }

        // Lock prize amount (deduct from wallet, add to lockedPrizePool)
        organizer.walletBalance -= prize;
        organizer.lockedPrizePool = (organizer.lockedPrizePool || 0) + prize;
        await organizer.save();

        // Save tournament and reflect prize locked on tournament doc
        console.log('💾 Saving tournament to MongoDB...');
        const tournament = new Tournament({
            ...tournamentData,
            prizeLocked: prize
        });
        await tournament.save();

        // Record transaction
        await Transaction.create({
            id: genId(),
            userId: organizer.id,
            userType: 'organizer',
            type: 'lock',
            amount: prize,
            reference: `lock_prize_${tournament.id}`,
            meta: { tournamentId: tournament.id }
        });
        
        console.log('✅ Tournament saved successfully!');
        console.log('Tournament details:', {
            id: tournament.id,
            name: tournament.tournamentName,
            organizer: tournament.organizerName,
            status: tournament.status
        });

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

// PUT update tournament links (stream/discord) - organizer-only before registration closes
router.put('/:id/links', async (req, res) => {
    try {
        const { streamUrl, discordUrl, organizerId } = req.body || {};

        const tournament = await Tournament.findOne({ id: req.params.id });
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        // Basic organizer check (lightweight since we don't have auth tokens)
        if (!organizerId || organizerId !== tournament.organizerId) {
            return res.status(403).json({ success: false, message: 'Only the tournament organizer can update links' });
        }

        // Only allow editing while registration is open and before deadline
        const now = new Date();
        const regDeadline = tournament.registrationDeadline ? new Date(tournament.registrationDeadline) : null;
        const regClosed = regDeadline ? now > regDeadline : false;
        if (tournament.status !== 'registration-open' || regClosed) {
            return res.status(400).json({ success: false, message: 'Registration is closed; links cannot be edited' });
        }

        // Whitelist only the two link fields
        if (typeof streamUrl !== 'undefined') tournament.streamUrl = streamUrl;
        if (typeof discordUrl !== 'undefined') tournament.discordUrl = discordUrl;

        await tournament.save();

        res.json({ success: true, message: 'Links updated successfully', data: { streamUrl: tournament.streamUrl, discordUrl: tournament.discordUrl } });
    } catch (error) {
        console.error('Error updating links:', error);
        res.status(400).json({ success: false, message: 'Error updating links', error: error.message });
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

        // Check if player already registered BEFORE any financial operations
        const alreadyRegistered = tournament.participants.some(
            p => p.playerId === playerId
        );

        if (alreadyRegistered) {
            return res.status(400).json({
                success: false,
                message: 'Player already registered for this tournament'
            });
        }

        // If entry fee is required, process financial operations with simple rollback safety
        if (tournament.hasEntryFee && (tournament.entryFee || 0) > 0) {
            const player = await Player.findOne({ id: playerId });
            if (!player) {
                return res.status(404).json({ success: false, message: 'Player not found' });
            }
            const fee = parseInt(tournament.entryFee, 10) || 0;
            if ((player.walletBalance || 0) < fee) {
                return res.status(400).json({ success: false, message: 'Insufficient player wallet balance to pay entry fee' });
            }

            let playerDeducted = false;
            try {
                // Deduct from player
                player.walletBalance -= fee;
                await player.save();
                playerDeducted = true;

                await Transaction.create({
                    id: genId(),
                    userId: player.id,
                    userType: 'player',
                    type: 'deduct',
                    amount: fee,
                    reference: `entry_fee_${tournament.id}`,
                    meta: { tournamentId: tournament.id }
                });

                // Credit the organizer
                const organizer = await Organizer.findOne({ id: tournament.organizerId });
                if (organizer) {
                    organizer.walletBalance = (organizer.walletBalance || 0) + fee;
                    await organizer.save();

                    await Transaction.create({
                        id: genId(),
                        userId: organizer.id,
                        userType: 'organizer',
                        type: 'fee-credit',
                        amount: fee,
                        reference: `entry_fee_credit_${tournament.id}`,
                        meta: { tournamentId: tournament.id, fromPlayerId: player.id }
                    });
                }

                // Track total collected entry fees on the tournament
                tournament.entryFeeCollected = (tournament.entryFeeCollected || 0) + fee;
            } catch (feeErr) {
                console.error('💥 Entry fee processing error, attempting rollback:', feeErr);
                // Rollback player deduction if it was applied
                if (playerDeducted) {
                    player.walletBalance += (parseInt(tournament.entryFee, 10) || 0);
                    await player.save();
                }
                // Remove player deduction transaction if it exists
                await Transaction.deleteOne({ userId: player.id, reference: `entry_fee_${tournament.id}` });
                return res.status(500).json({ success: false, message: 'Failed processing entry fee. Please try again.', error: feeErr.message });
            }
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

// POST declare tournament result (organizer-only after match end) - AUTO SELECTS 3 RANDOM WINNERS
router.post('/:id/declare-result', async (req, res) => {
    try {
        const { organizerId } = req.body || {};
        const tournament = await Tournament.findOne({ id: req.params.id });
        if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });

        // Must match organizer
        if (!organizerId || organizerId !== tournament.organizerId) {
            return res.status(403).json({ success: false, message: 'Only the creating organizer can declare results' });
        }

        // Must not be already completed / declared
        if (tournament.status === 'completed' || tournament.resultDeclaredAt) {
            return res.status(400).json({ success: false, message: 'Results already declared' });
        }

        // Must be after match end (use endDate or fallback window 2h after start)
        const startMs = tournament.startDate ? new Date(tournament.startDate).getTime() : 0;
        const endMs = tournament.endDate ? new Date(tournament.endDate).getTime() : (startMs + 2*60*60*1000);
        if (Date.now() < endMs) {
            return res.status(400).json({ success: false, message: 'Match not finished yet' });
        }

        // Must have at least 3 participants
        if (!tournament.participants || tournament.participants.length < 3) {
            return res.status(400).json({ success: false, message: 'Need at least 3 participants to declare results' });
        }

        // Parse prize distribution (e.g., "60-30-10")
        const distro = (tournament.prizeDistribution || '60-30-10').split('-').map(v => parseInt(v, 10));
        if (distro.length < 3 || distro.some(v => isNaN(v) || v < 0)) {
            return res.status(400).json({ success: false, message: 'Invalid prize distribution format' });
        }

        const totalPercent = distro[0] + distro[1] + distro[2];
        const prizePool = tournament.prizeLocked || 0;

        // Calculate prize amounts
        const prize1 = Math.floor((prizePool * distro[0]) / totalPercent);
        const prize2 = Math.floor((prizePool * distro[1]) / totalPercent);
        const prize3 = Math.floor((prizePool * distro[2]) / totalPercent);
        const totalPrize = prize1 + prize2 + prize3;

        // Randomly select 3 winners from participants
        const shuffled = [...tournament.participants].sort(() => Math.random() - 0.5);
        const selectedWinners = shuffled.slice(0, 3);

        const winners = [
            { position: 1, playerId: selectedWinners[0].playerId, playerName: selectedWinners[0].playerName, teamName: selectedWinners[0].teamName || selectedWinners[0].playerName, prize: prize1 },
            { position: 2, playerId: selectedWinners[1].playerId, playerName: selectedWinners[1].playerName, teamName: selectedWinners[1].teamName || selectedWinners[1].playerName, prize: prize2 },
            { position: 3, playerId: selectedWinners[2].playerId, playerName: selectedWinners[2].playerName, teamName: selectedWinners[2].teamName || selectedWinners[2].playerName, prize: prize3 }
        ];

        // Credit winners (players) and deduct locked prize from organizer's locked pool
        const organizer = await Organizer.findOne({ id: tournament.organizerId });
        if (!organizer) return res.status(404).json({ success: false, message: 'Organizer not found' });
        if ((organizer.lockedPrizePool || 0) < totalPrize) {
            return res.status(400).json({ success: false, message: 'Organizer locked prize pool insufficient for distribution' });
        }

        // Apply transactions for each winner prize
        for (const w of winners) {
            const player = await Player.findOne({ id: w.playerId });
            if (!player) {
                return res.status(404).json({ success: false, message: 'Player winner not found: ' + w.playerId });
            }
            player.walletBalance = (player.walletBalance || 0) + w.prize;
            await player.save();
            if (w.prize > 0) {
                await Transaction.create({
                    id: genId(),
                    userId: player.id,
                    userType: 'player',
                    type: 'prize-credit',
                    amount: w.prize,
                    reference: `prize_${tournament.id}_pos${w.position}`,
                    meta: { tournamentId: tournament.id, position: w.position }
                });
            }
        }

        // Deduct from organizer locked pool & tournament prizeLocked
        organizer.lockedPrizePool = (organizer.lockedPrizePool || 0) - totalPrize;
        await organizer.save();
        tournament.prizeLocked = (tournament.prizeLocked || 0) - totalPrize;

        // Persist winners list to tournament
        tournament.winners = winners;
        tournament.resultDeclaredAt = new Date();
        tournament.resultsVisible = true; // Make results publicly visible
        tournament.status = 'completed';
        await tournament.save();

        // Transaction for organizer distribution (aggregate)
        if (totalPrize > 0) {
            await Transaction.create({
                id: genId(),
                userId: organizer.id,
                userType: 'organizer',
                type: 'prize-distribute',
                amount: totalPrize,
                reference: `prize_distribute_${tournament.id}`,
                meta: { tournamentId: tournament.id }
            });
        }

        res.json({ success: true, message: 'Results declared', data: { tournamentId: tournament.id, winners: tournament.winners } });
    } catch (err) {
        console.error('Error declaring result:', err);
        res.status(500).json({ success: false, message: 'Error declaring result', error: err.message });
    }
});
module.exports = router;
