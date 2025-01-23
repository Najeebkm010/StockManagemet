const express = require("express")
const router = express.Router();
const auth = require('../middleware/staffauth');
const { sendStockRequestEmail } = require("../services/emailService");
// New route for sending email with stock requests
router.post('/sendEmail', auth, async (req, res) => {
    try {
        const { pendingRequests, AllpendingRequests} = req.body;
        console.log(req.body , "hi bodies");
        const reqArray = []
        reqArray.push(pendingRequests)
        await sendStockRequestEmail(
            req.user.username, 
            reqArray, 
            AllpendingRequests
        );
        
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

module.exports = router;