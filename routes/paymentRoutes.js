const express = require('express');
const router = express.Router();

const { createPayment, getPayments, getMyPayments, getOrderPayments, updatePaymentStatus } = require('../controllers/paymentController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware.js');
const mpesaCallback = require('../webhooks/mpesaWebhook.js');

//payments routes
//initiate payment - logged-in user checkout
router.post("/", protect, createPayment);

//safarcom callback webhook
router.post("/mpesa/callback", mpesaCallback);

//get all payments - admin only
router.get("/", protect, authorize("admin"), getPayments);

//get logged-in user's payments
router.get("/me", protect, getMyPayments); 

//get payments for one order - admin or owner
router.get("/order/:orderId", protect, authorize("admin", "customer"), getOrderPayments);  

//update payment status - admin/webhook
router.patch("/:id/status", authorize("admin"), updatePaymentStatus);    


module.exports = router;
