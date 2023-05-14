//===================== Importing Packages =====================//
const mongoose = require("mongoose");

//===================== Creating course Schema =====================//
const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
        },
        
        deletedAt: {
            type: Date,
            default: null,
        },
        

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    
    { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);