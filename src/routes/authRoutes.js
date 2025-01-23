const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StaffModel = require('../models/StaffModel')

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for username:', username);

        // Check if the user is an admin or staff
        const admin = await User.findOne({ username})
        // Compare password
        if(admin && admin.userType === 1){
            const isMatch = await bcrypt.compare(password, admin.password);
            console.log('Password match:', isMatch);
            
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
            res.json({ 
                token, 
                userType: admin.userType,
                message: 'Login successful'
            });
        }else{ 
            const staff=await StaffModel.findOne({username})
            if(!staff){
                return res.status(400).json({ error: "Not found"})
            }
            const isMatch = await bcrypt.compare(password, staff.password);
            console.log('Password match:', isMatch);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jwt.sign({ id: staff._id }, process.env.JWT_SECRET);
            res.json({ 
                token, 
                userType: staff.userType,
                message: 'Login successful'
            });
        }
        console.log('User found:', username);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;