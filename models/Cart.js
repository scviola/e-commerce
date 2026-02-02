const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
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
                    min: 1,
                    default: 1
                }
            }
        ]
    }, {timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }}
);

// Virtual field for stock status for selected item
cartSchema.virtual('inStock').get(function() {
    if (!this.product) return null; // Product not populated
    return this.product.stockQuantity >= this.quantity ? "In Stock" : "Out of Stock";
});

// Virtual field for remaining stock
cartSchema.virtual('stockRemaining').get(function() {
    if (!this.product) return null; 
    return this.product.stockQuantity;
});

//prevent duplicate product entries
cartSchema.index({user: 1, product: 1}, {unique: true});


module.exports = mongoose.model("Cart", cartSchema);