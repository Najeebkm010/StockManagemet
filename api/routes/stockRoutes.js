const express = require('express');
const router = express.Router();
const auth = require('../middleware/staffauth');

const StockRequest = require('../models/StockRequest');

router.post('/request', auth, async (req, res) => {
    try {
        const stockRequest = new StockRequest({
            ...req.body,
            requestedBy: req.user._id
        });
        await stockRequest.save();
        res.status(201).json(stockRequest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/requests', auth, async (req, res) => {
    try {
        const requests = await StockRequest.find({ requestedBy: req.user._id, status:"pending" });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;