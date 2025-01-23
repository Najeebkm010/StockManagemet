require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function verifyLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the admin user
        const user = await User.findOne({ username: 'admin' });
        if (!user) {
            console.log('Admin user not found in database!');
            return;
        }

        console.log('User found in database:');
        console.log('Username:', user.username);
        console.log('Role:', user.role);
        console.log('Created At:', user.createdAt);

        // Test password
        const testPassword = 'admin123';
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log('\nPassword test results:');
        console.log('Is password correct?', isMatch);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

verifyLogin();