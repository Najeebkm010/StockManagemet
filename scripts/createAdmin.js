// scripts/createAdmin.js
const express = require('express');
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function createAdminUser() {
    try {
        console.log(process.env.MONGODB_URI, "env");
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create admin user
        const adminUser = new User({
            username: 'Najeeb',
            password: 'Pass@123', // This will be hashed automatically by the User model
            role: 'admin',
            userType: 1
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createAdminUser();