const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        order: {        //order_id generated
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true 
        },
        method: {
            type: String,
            enum: ["Card", "Cash", "Mpesa", "Paypal"],
            required: true 
        },
        amount: {
            type: Number,
            required: true 
        },
        status: {
            type: String,
            enum: [
                "Pending",      // payment initiated, not confirmed
                "Completed",    // money received
                "Failed",       // payment attempt failed
                "Cancelled",    // user cancelled payment
                "Refunded"      // money returned
            ],
            default: "Pending" 
        },
        checkoutRequestId: {    //callback ID
            type: String
        },
        merchantRequestId: {    //mpesa internal tracking ID
            type: String
        },
        transactionId: {     // from payment gateway
            type: String 
        },  
        paidAt: {
            type: Date 
        },

    }, { timestamps: true }
);


module.exports = mongoose.model("Payment", paymentSchema);
