//===================== Importing Packages =====================//
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

//===================== Creating Payment Schema =====================//
const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            required: true,
            ref: 'User',
            unique: true
        },

        items: [{
            courseId: { type: ObjectId, ref: 'Course', required: true },
            _id: false
        }],

        totalPrice: {
            type: Number,
            required: true
        },

        totalCourse: {
            type: Number,
            required: true
        },

        paymentStatus: {
            type: Boolean,
            default: false
        }
    },

    { timestamps: true }
);



module.exports = mongoose.model("Cart", cartSchema);