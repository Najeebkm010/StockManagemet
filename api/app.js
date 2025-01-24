const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const adminRoutes = require('./routes/adminRoutes');
const emailsendRout = require('./routes/send-emailRoute')
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/send-email', emailsendRout);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'));
}

module.exports = app;
