const Product = require('../models/Product');
const mongoose = require('mongoose');
const Order = require('../models/Order');

//CRUD
// POST/products - create product - admin only
const createProduct = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        const { name, category, price, currency, description, stockQuantity, images, metadata } = req.body;
        if(!name || !category || price == null || !description || !stockQuantity)
            return res.status(400).json({message: "Missing required fields"});

        const existing = await Product.findOne({name});
        if (existing)
            return res.status(409).json({message: "Product already exists"});

        const product = await Product.create({name, category, price, currency, description, stockQuantity, images, metadata});

        res.status(201).json({message: "Product added successfully", product});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// GET/products - get products(filters, search, pagination, sort)
const getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, page = 1, limit = 10, sort } = req.query;

        const query = {isActive: true};

        //filter by category
        if (category)
            query.category = category;

        //filter by price range
        if (minPrice || maxPrice)
            query.price = {};
        if (minPrice)
            query.price.$gte = Number(minPrice);
        if (maxPrice)
            query.price.$lte = Number(maxPrice);

        //text search - name & description
        if (search)
            query.$text = {$search: search};

        //pagination
        const pageNumber = Number(page);
        const pageSize = Number(limit);
        const skip = (pageNumber - 1) * pageSize;

        //sorting
        let sortOptions = {};

        if (sort === "price") sortOptions.price = 1; //cheapest
        if (sort === "-price") sortOptions.price = -1; //expensive
        if (sort === "newest") sortOptions.createdAt = -1; //latest products
        if (sort === "popular") sortOptions.salesCount = -1; //huge sales
        
        
        const products = await Product.find(query)
        .populate("category", "name")
        .skip(skip)
        .limit(pageSize)
        .sort(sortOptions); 

        if (!products || products.length === 0)
            return res.status(200).json({message: "No products yet"})

        const total = await Product.countDocuments(query);

        res.status(200).json({
            total,
            page: pageNumber,
            pages: Math.ceil(total / pageSize),
            count: products.length,
            products
        });

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// GET/products/:id - getproductbyid
const getProduct = async (req, res) => {
    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({message: "Invalid product ID"});

        const product = await Product.findById(req.params.id)
        .populate("category", "name")
        .select("-_v"); //dont add version field

        if (!product)
            return res.status(404).json({message: "Product not found"});

        res.status(200).json(product);

    } catch (error) {
         res.status(500).json({message: error.message});
    }
};

// PUT/:id - updateproduct - admin only
const updateProduct = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        if(!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({message: "Invalid product ID"});

        const allowedFields = ["name", "category", "price", "description", "stockQuantity", "images", "metadata"];
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field])
                updates[field] = req.body[field];
        });

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            {new: true, runValidators: true}
        ).populate("category", "name");
    
        if (!updatedProduct)
            return res.status(404).json({message: "Product not found"});

        res.status(200).json({message: "Product updated successfully", updatedProduct});

    } catch (error) {
         res.status(500).json({message: error.message});
    }
};

// DELETE/:id - delete product - admin only
const deleteProduct = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        if(!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({message: "Invalid product ID"});

        //if product is in active orders
        const pendingOrder = await Order.findOne({
            "items.product": req.params.id,
            orderStatus: {$in: ["Pending", "Paid", "Processing", "Shipped", "ReadyForPickup", "Cancelled"]}
        });

        if (pendingOrder)
            return res.status(400).json({message: "Cannot delete product: it exists in active orders"});
        
        //soft delete
        const deletedProduct = await Product.findByIdAndDelete(
        req.params.id,
        {isDeleted: true, isActive: false}, 
        {new: true}    //keep historical orders to restore later if need be
        ).populate("category", "name");
    
        if (!deletedProduct)
            return res.status(404).json({message: "Product not found"});

        res.status(200).json({message: "Product deleted successfully", deletedProduct});

    } catch (error) {
         res.status(500).json({message: error.message});
    }
};


module.exports = { createProduct, getProducts, getProduct, updateProduct, deleteProduct };