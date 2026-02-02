const Cart = require('../models/Cart');
const Product = require('../models/Product');

// POST/ - add product to cart - logged-in user
const addToCart = async (req, res) => {
    try {
        const {productId, quantity = 1} = req.body;

        if (!productId)
            return res.status(400).json({message: "Product ID required"});

        const product = await Product.findById(productId);
        if (!product)
            return res.status(400).json({message: "Product not found"});

        if (product.stockQuantity < quantity)
            return res.status(400).json({message: "Insufficient stock"});

        //cart
        let cart = await Cart.findOne({user: req.user.id});

        //if no cart already
        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: [{product: productId, quantity}]
            });
        }
        else {
            const existingItem = cart.items.find(
                item => item.product.toString() === productId
            );

            if (existingItem) {  // product already in cart; increase quantity
                existingItem.quantity += quantity;
            } else {
                // product not in cart; add new item
                cart.items.push({
                    product: productId,
                    quantity
                });
            }

            await cart.save();
        }

        res.status(200).json(({message: "Item added to cart", cart}));

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// GET/ - get logged-in user cart
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate("items.product", "name price stockQuantity");

        if (!cart)
            return res.status(200).json({message: "No items in the cart", items: [] });

        res.status(200).json(cart);

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// PATCH /cart/:productId - update quantity item
const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity < 1)
            return res.status(400).json({message: "Invalid input"});

        const cart = await Cart.findOne({user: req.user.id});
        if (!cart)
            return res.status(404).json({message: "Cart not found"});

        const item = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!item)
            return res.status(404).json({message: "Item not in cart"});

        else
            item.quantity = quantity;

        await cart.save();

        res.status(200).json({message: "Cart updated successfully", cart});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// DELETE /cart/:productId - remove product from cart
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const cartItems = await Cart.findOne({user: req.user.id});

         if (!cartItems || cartItems.length === 0)
            return res.status(404).json({message: "Cart is empty"});

        let productFound = false;

        for (const item of cartItems) {
            if (item.product.toString() === productId) {
                await item.deleteOne();
                productFound = true;
                break;
            }
        }

        if (!productFound) {
            return res.status(404).json({message: "Product not found in cart"});
        }
            
        res.status(200).json({message: "Product removed from the cart", productFound});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// DELETE/ - clear cart after checkout
const clearCart = async (req, res) => {
    try {
        const cleared = await Cart.findOneAndDelete({user: req.user.id});

        res.status(200).json({message: "Cart cleared successfully", cleared});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


module.exports = { addToCart, getCart, updateCartItem, removeFromCart, clearCart };