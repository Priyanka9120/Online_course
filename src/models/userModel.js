//===================== Importing Packages =====================//
const mongoose = require('mongoose');
//===================== Creating User's Schema =====================//
const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },

    whatsappNumber: {
        type: String,
        required: true,
        unique: true
    },

    number: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true

    },
    
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema)