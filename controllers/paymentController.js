const Payment = require('../models/Payment');
const Order = require('../models/Order');   
const mongoose = require('mongoose');
const { initiateSTKPush } = require('../utils/mpesa');

//CRUD 
//POST/ - create mpesa payment -order checkout - user or system
const createPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { phoneNumber } = req.body;

        if (!phoneNumber)
            return res.status(400).json({message: "Phone number is required"});

        //validate order ID
        if (!mongoose.Types.ObjectId.isValid(orderId))
            return res.status(400).json({message: "Invalid order ID"});

        //retrieve order
        const order = await Order.findById(orderId);

        if (!order)
            return res.status(400).json({message: "Order not found"});

        //attach the order to the logged-in user/admin
        if (req.user.role !== "admin" && order.user.toString() !== req.user.id)
            return res.status(403).json({message: "Unauthorized"});

        //prevent duplicate pending payment
        const existingPayment = await Payment.findOne({
            order: orderId,
            status: "Pending"
        });

        if (existingPayment)
            return res.status(400).json({message: "Payment already pending"});

        //normalize phone number
        let formattedPhone = phoneNumber;
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "254" + formattedPhone.slice(1);
        }

        //trigger STK push
        const stkResponse = await initiateSTKPush({
            phoneNumber: formattedPhone,
            amount: order.totalPrice,
            orderId
        });
        
        //save payment after STK push success
        const payment = await Payment.create({
            user: req.user.id,
            order: orderId,
            method: "Mpesa",
            amount: order.totalPrice,
            status: "Pending",
            checkoutRequestId: stkResponse.checkoutRequestID,
            merchantRequestId: stkResponse.MerchantRequestID
        });

        //link payment to order(checkout)
        order.payments.push(payment._id); //payments=field in the Order collection
        await order.save();

        res.status(201).json({ message: "STK Push sent successfully", stkResponse, payment});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

//GET/ - get all payments - admin only
const getPayments = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        const payments = await Payment.find()
        .populate("user", "name email")
        .populate("order", "orderNumber totalPrice");

        if (!payments || payments.length === 0)
            return res.status(200).json({message: "No payments yet"})

        res.status(200).json({payments});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

//GET/me - get payments for specific user - logged-in user
const getMyPayments = async (req, res) => {
    try {
        const myPayments = await Payment.find({user: req.user.id})
        .populate("order", "orderNumber items totalPrice");

        if (!myPayments || myPayments.length === 0)
            return res.status(200).json({message: "You have no payments"})

        res.status(200).json({myPayments});
        
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

//GET/order/:orderId - get payments for specific order - admin or order owner
const getOrderPayments = async (req, res) => {
    try {
        const { orderId } = req.params;

        //validate order id
        if (!mongoose.Types.ObjectId.isValid(orderId))
            return res.status(400).json({message: "Invalid order ID"});

        //fetch the order
        const order = await Order.findById(orderId);
        if (!order)
            return res.status(404).json({message: "Order not found"});

        //authorize
        if (req.user.role !== "admin" && order.user.toString() !== req.user.id)
            return res.status(403).json({message: "Unauthorized"});

        //get payments for this order
        const orderPayments = await Payment.find({order: orderId})
        .populate("order", "orderNumber items totalPrice");

        if (!orderPayments || orderPayments.length === 0)
            return res.status(200).json({message: "No payments for this order"});

        res.status(200).json({orderPayments});
        
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

//PATCH/:id/status - update payment status - admin only or webhook
const updatePaymentStatus = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        const {status} = req.body;

        const statuses = ["Pending", "Completed", "Failed", "Cancelled", "Refunded"];
        if (!status || !statuses.includes(status))
            return res.status(400).json({message: "Invalid payment status"});

        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            {status},
            {new: true, runValidators: true}
        );

        if (!updatedPayment)
            return res.status(404).json({message: "Payment not found"});

        if (status === "Completed")
            await Order.findByIdAndUpdate(updatedPayment.order, {
                status: "Completed",
                orderStatus: "Paid"
                });

        res.status(200).json({message: "Payment status updated successfully", updatedPayment});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


module.exports = { createPayment, getPayments, getMyPayments, getOrderPayments, updatePaymentStatus };