const express = require('express');
const router = express.Router();
const Organizer = require('../models/Organizer');

// GET all organizers with optional filtering
router.get('/', async (req, res) => {
    try {
        const { 
            search, 
            status, 
            limit = 50, 
            page = 1 
        } = req.query;

        let query = {};

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { organization_name: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const organizers = await Organizer.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .select('-bank_details -verification_documents'); // Exclude sensitive information

        const total = await Organizer.countDocuments(query);

        res.json({
            success: true,
            data: organizers,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });

    } catch (error) {
        console.error('Error fetching organizers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organizers',
            error: error.message
        });
    }
});

// GET single organizer by ID
router.get('/:id', async (req, res) => {
    try {
        const organizer = await Organizer.findOne({ id: req.params.id })
            .select('-bank_details -verification_documents'); // Exclude sensitive information
        
        if (!organizer) {
            return res.status(404).json({
                success: false,
                message: 'Organizer not found'
            });
        }

        res.json({
            success: true,
            data: organizer
        });

    } catch (error) {
        console.error('Error fetching organizer:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organizer',
            error: error.message
        });
    }
});

// POST create new organizer
router.post('/', async (req, res) => {
    try {
        const organizerData = req.body;

        // Generate ID if not provided
        if (!organizerData.id) {
            organizerData.id = 'org_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        }

        const organizer = new Organizer(organizerData);
        await organizer.save();

        // Remove sensitive information from response
        const organizerResponse = organizer.toObject();
        delete organizerResponse.bank_details;
        delete organizerResponse.verification_documents;

        res.status(201).json({
            success: true,
            message: 'Organizer application submitted successfully',
            data: organizerResponse
        });

    } catch (error) {
        console.error('Error creating organizer:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Organizer with this email already exists'
            });
        }

        res.status(400).json({
            success: false,
            message: 'Error creating organizer',
            error: error.message
        });
    }
});

// PUT update organizer
router.put('/:id', async (req, res) => {
    try {
        const organizer = await Organizer.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        ).select('-bank_details -verification_documents');

        if (!organizer) {
            return res.status(404).json({
                success: false,
                message: 'Organizer not found'
            });
        }

        res.json({
            success: true,
            message: 'Organizer updated successfully',
            data: organizer
        });

    } catch (error) {
        console.error('Error updating organizer:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating organizer',
            error: error.message
        });
    }
});

// DELETE organizer
router.delete('/:id', async (req, res) => {
    try {
        const organizer = await Organizer.findOneAndDelete({ id: req.params.id });

        if (!organizer) {
            return res.status(404).json({
                success: false,
                message: 'Organizer not found'
            });
        }

        res.json({
            success: true,
            message: 'Organizer deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting organizer:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting organizer',
            error: error.message
        });
    }
});

// GET organizer statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const stats = await Organizer.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await Organizer.countDocuments();
        const approved = await Organizer.countDocuments({ status: 'approved' });
        const suspended = await Organizer.countDocuments({ status: 'suspended' });

        res.json({
            success: true,
            data: {
                total,
                approved,
                suspended,
                breakdown: stats
            }
        });

    } catch (error) {
        console.error('Error fetching organizer stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organizer stats',
            error: error.message
        });
    }
});

module.exports = router;