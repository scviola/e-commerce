const express = require('express');
const router = express.Router();

const { addToCart, getCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const protect = require("../middleware/authMiddleware");

//cart routes
//add product to cart
router.post("/", protect, addToCart);

//get logged-in user's cart
router.get("/", protect, getCart);

//update quantity
router.patch("/:productId", protect, updateCartItem);

//remove product from cart
router.delete("/:productId", protect, removeFromCart);

//clear entire cart after checkout
router.delete("/", protect, clearCart);


module.exports = router;