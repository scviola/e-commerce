const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        orderNumber: {
            type: String,
            unique: true,
            default: () => 'ORD-' + Date.now()
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ],
        totalPrice: {
            type: Number,
            required: true
        },
        orderStatus: {
            type: String,
            enum: [
                "Pending",     // Order created, not paid
                "Paid",        // Payment confirmed
                "Processing",  // Preparing items
                "Shipped",     // Sent to courier (shipping only)
                "ReadyForPickup", // Pickup orders only
                "Delivered",   // Shipped & received
                "Completed",   // Pickup collected OR delivery confirmed
                "Cancelled"
            ],
            default: "Pending"
        },
        payments: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment"
        },
        deliveryMethod: {
            type: String,
            required: true,
            enum: ["Shipping", "Pickup"],
            default: "Shipping"
        },
        shipping: {
            address: { 
                type: String,
                required: function() {
                    return this.deliveryMethod === "Shipping";
                }
            },
            city: {
                type: String,
                required: function() {
                    return this.deliveryMethod === "Shipping";
                }
            },
            postalCode: {
                type: String,
                required: function() { 
                    return this.deliveryMethod === "Shipping";
                }
            }
        },
        pickupLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PickupLocation",
            required: function() { 
                return this.deliveryMethod === "Pickup";
            }
        }
    }, {timestamps: true}
);


module.exports = mongoose.model("Order", orderSchema);