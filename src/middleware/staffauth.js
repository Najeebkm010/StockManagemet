const jwt = require('jsonwebtoken');
// const User = require('../models/User');
const StaffModel = require('../models/StaffModel');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error('No token provided');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const staff = await StaffModel.findOne({ _id: decoded.id });
        
        if (!staff) {
            throw new Error('User not found');
        }
        
        req.user = staff;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

module.exports = auth;
