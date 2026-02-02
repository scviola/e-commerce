const mongoose = require('mongoose');

const pickupLocationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }, {timestamps: true}
);

module.exports = mongoose.model("PickupLocation", pickupLocationSchema);