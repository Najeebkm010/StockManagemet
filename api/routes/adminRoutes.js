// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/adminauth');
const User = require('../models/User');
const StockRequest = require('../models/StockRequest');
const StaffModel = require('../models/StaffModel');
const { route } = require('./authRoutes');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    if (req.user.userType !== 1) {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

// Create staff account
router.post('/staff', auth, isAdmin, async (req, res) => {
    try {
        const user = new StaffModel({
            username: req.body.username,
            password: req.body.password,
            role: 'staff'
        });
        await user.save();
        res.status(201).json({ message: 'Staff account created' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Load staff
router.get('/staff', async (req, res) => {
    try {
        const staff = await StaffModel.find().select('username createdAt _id');
        res.status(200).json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ error: 'Failed to fetch staff list' });
    }
});

// Delete staff account
router.delete('/staff/:id', auth, isAdmin, async (req, res) => {
    try {
        const staffId = req.params.id;

        // Check if the staff account exists
        const staff = await StaffModel.findById(staffId);
        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        // Delete the staff account
        await StaffModel.findByIdAndDelete(staffId);
        res.status(200).json({ message: 'Staff member deleted successfully' });
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({ error: 'Failed to delete staff member' });
    }
});

// Stock report
router.get('/reports', auth, isAdmin, async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const pipeline = [
            {
              $match: {
                submittedAt:{
                  $gte : new Date(start),
                  $lte: new Date(end)

                }
              }
            },
            {
              $lookup: {
                from: "staffs",
                localField:"requestedBy" ,
                foreignField: "_id",
                as: "staff"
              },
            },
              {
                $unwind: {
                  path: "$staff",
                  preserveNullAndEmptyArrays: false
                }
            
              },
            {
              $project: {
                _id:0,
                category:1,
                  description:1,
                quantity:1,
                priority:1,
                submittedAt:1,
                status:1,
                userName:"$staff.username"
              }
            }
            
          ]

    const data = await StockRequest.aggregate(pipeline)

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});


// Get all stock requests (admin only)
router.get('/requests', auth, isAdmin, async (req, res) => {
    try {
        const pipeline = [
            {
              $lookup: {
                from: "staffs",
                localField:"requestedBy" ,
                foreignField: "_id",
                as: "staff"
              },
            },
              {
                $unwind: {
                  path: "$staff",
                  preserveNullAndEmptyArrays: false
                }
            
              },
            {
              $project: {
                _id:1,
                category:1,
                  description:1,
                quantity:1,
                priority:1,
                submittedAt:1,
                status:1,
                userName:"$staff.username"
              }
            }
        ]
        const requests = await StockRequest.aggregate(pipeline);
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update stock request status
router.patch('/requests/:id', auth, isAdmin, async (req, res) => {
    try {
        const request = await StockRequest.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(request);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}); 

module.exports = router;