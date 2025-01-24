const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the Staff schema
const StaffSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: Number,
        enum: [1,0]
    }
    
},{
    timestamps: true
});

// Pre-save hook to hash the password before saving
StaffSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords for authentication
StaffSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create the Staff model
const StaffModel = mongoose.model('Staff', StaffSchema);

module.exports = StaffModel;
