const express = require('express');
const router = express.Router();

const { createOrder, getOrders, getMyOrders, getOrder, updateOrderStatus } = require('../controllers/orderController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware.js');

//orders 
router.post("/", protect, createOrder); //logged-in user checkout
router.get("/", protect, authorize("admin"), getOrders); //admin only
router.get("/me", protect, getMyOrders); //logged-in user only
router.get("/:id", protect, authorize("admin", "customer"), getOrder);   //admin or owner
router.patch("/:id/status", protect, authorize("admin"), updateOrderStatus);    //admin only


module.exports = router;
