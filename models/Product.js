const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        category: {     
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: "KES"
        },
        description: {          //describes the product
            type: String,
            required: true,
            trim: true
        },
        stockQuantity: {
            type: Number,
            required: true,
            min: 0
        },
        salesCount: {           //popular products
            type: Number,
            default: 0
        },
        images: [{
            type: String        //url to product image
        }],
        slug: {                 //url for product page
            type: String,
            unique: true,
            lowercase: true,
            index: true
        },
        metadata: {             //SEO info for specific product
            title: String,
            description: String,
            keywords: [String]
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }, {timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

//autogenerate slug
productSchema.pre("save", function (next) {
    if (!this.isModified("name")) //do nothing
        return next();
    else
        this.slug = slugify(this.name, {lower: true, strict: true});
    //next();
});

//virtual field for stock status
productSchema.virtual('inStock').get(function() {
    return this.stockQuantity > 0 ? "In Stock" : "Out of Stock";
});

//indexes
productSchema.index({name: "text", description: "text"}); //search
productSchema.index({category: 1}); //filtering
productSchema.index({price: 1}); //sorting ascending


module.exports = mongoose.model("Product", productSchema);