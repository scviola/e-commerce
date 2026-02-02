const Order = require('../models/Order');
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require('mongoose');

//orders are controlled - not full CRUD
// POST/ - create order (checkout)
const createOrder = async (req, res) => {
    const session = await mongoose.startSession(); //mongodb transactions so entire order process succeeds or rolled back if fails

    try {
        session.startTransaction();

        const userId = req.user.id;

        const { deliveryMethod, shipping, pickupLocation } = req.body;

        if (!deliveryMethod)
            return res.status(400).json({message: "Enter delivery method"});

        //validate delivery method
        if (deliveryMethod === "Shipping" && (!shipping || !shipping.address || !shipping.city || !shipping.postalCode))
            return res.status(400).json({message: "Shipping info required"});

        if (deliveryMethod === "Pickup" && !pickupLocation)
            return res.status(400).json({message: "Pickup location required"});

        //fetch cart for this user
        const cart = await Cart.findOne({ user: userId })
        .populate("items.product", "name price stockQuantity")
        .session(session);

        if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
        }

        //convert cart items to order items
        let orderItems = [];
        let totalPrice = 0;

        for (let item of cart.items) {
            if(!item.product) {
                return res.status(400).json({message: "Cart has invalid product references"});
            }

            //check stock
            if (item.product.stockQuantity < item.quantity) {
                return res.status(400).json({
                message: `Not enough stock for ${item.product.name}`,
                });
            }

            orderItems.push({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price,
            });

            //calculate subtotal
            const subTotal = item.product.price * item.quantity;
            totalPrice += subTotal;
        }

        //transactions
        //create order
        const order = await Order.create(
            [
                {
                    user: userId,
                    items: orderItems,
                    totalPrice,
                    deliveryMethod,
                    shipping: deliveryMethod === "Shipping" ? shipping: null,
                    pickupLocation: deliveryMethod === "Pickup" ? pickupLocation: null
                }
            ],
            { session }
        );

        //reduce stock quantities
        for (let item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, 
                { $inc: { stockQuantity: -item.quantity } },
                { session }
            );
        }

        //clear cart after successful checkout
        cart.items = [];
        await cart.save({session});

        //commit transaction - success
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({message: "Order created successfully from cart", order});

    } catch (error) {
        //rollback everything if error occurs
        await session.abortTransaction();
        session.endSession();

        res.status(500).json({message: error.message});
    }
};

// GET/ - get all orders - admin only
const getOrders = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        const orders = await Order.find()
        .populate("user", "name email")
        .populate("items.product", "name category price");

        if (!orders || orders.length === 0)
            return res.status(200).json({message: "No orders yet"});

        res.status(200).json({orders});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// GET/me - get orders of a logged-in user
const getMyOrders = async (req, res) => {
    try {
        const myOrders = await Order.find({user: req.user.id})
        .populate("items.product", "name category price")
        .sort({createdAt: -1});

        if (!myOrders || myOrders.length === 0)
            return res.status(200).json({message: "You have not made any orders yet!"});

        res.status(200).json({orders: myOrders});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// GET/:id - get one order by id - admin/order owner
const getOrder = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({message: "Invalid order ID"});

        const order = await Order.findById(req.params.id)
        .populate("items.product", "name category price");

        if (!order)
            return res.status(404).json({message: "Order not found"});

        //authorize
        if (req.user.role !== "admin" && order.user.toString() !== req.user.id)
            return res.status(403).json({message: "Access denied"});

        res.status(200).json({order});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// PATCH/:id/status - update order status - admin only
const updateOrderStatus = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({message: "Invalid order ID"});

        const { orderStatus } = req.body;
        const statuses = ["Pending", "Paid", "Processing", "Shipped", "ReadyForPickup", "Delivered", "Completed", "Cancelled"];

        if (!orderStatus || !statuses.includes(orderStatus))
            return res.status(400).json({message: "Invalid or missing orderStatus"});

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {orderStatus},
            {new: true, runValidators: true}
        );

        if (!updatedOrder)
            return res.status(404).json({message: "Order not found"});

        res.status(200).json({message: "Order status updated successfully", updatedOrder});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


module.exports = { createOrder, getOrders, getMyOrders, getOrder, updateOrderStatus };