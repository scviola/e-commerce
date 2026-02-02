const mongoose = require('mongoose');

const userSchema = new mongoose.Schema (
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phoneNumber: {
            type: String, // to match numbers with country codes e.g +254
            unique: true,
            match: /^[0-9]{9,15}$/, // regex for 9-15 digits
            sparse: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false
        },
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer"
        },
        passwordResetToken: {
            type: String
        },
        passwordResetExpires: {
            type: Date
        }
    }, {timestamps: true}
);


module.exports = mongoose.model("User", userSchema);