const Category = require('../models/Category');
const mongoose = require('mongoose');
const Product = require('../models/Product');

//CRUD
//POST/ - create product category - admin only
const createCategory = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        const { name, description, image, metadata } = req.body;

        if (!name || !description)
            return res.status(400).json({message: "Category name and description required"});

        const existing = await Category.findOne({name});
        if (existing)
            return res.status(409).json({message: "Category already exists"});

        const category = await Category.create({name, description, image, metadata});
        res.status(201).json({message: "Category created successfully", category});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// GET/ - get product categories - public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        if (!categories || categories.length === 0)
            return res.status(200).json({message: "No product categories found"});

        res.status(200).json({categories});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// GET/:id - get product category by id 
const getCategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({message: "Invalid category ID"});

        const category = await Category.findById(req.params.id);

        if (!category)
            return res.status(404).json({message: "Category not found"});

        res.status(200).json({category});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// PUT/:id - update product category - admin only
const updateCategory = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({message: "Invalid category ID"});

        const allowedFields = ["name", "description", "image", "metadata"];

        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field])
                updates[field] = req.body[field];
        });

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updates,
            {new: true, runValidators: true}
        );

        if (!updatedCategory)
            return res.status(404).json({message: "Category not found"});

        res.status(200).json({message: "Category updated successfully", updatedCategory});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// DELETE/:id - delete product category - admin only
const deleteCategory = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({message: "Invalid category ID"});

        //if category has products
        const has_products = await Product.find({category: req.params.id});
        if (has_products.length > 0)
            return res.status(400).json({message: "Cannot delete category with products"});

        const deletedCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deletedCategory)
            return res.status(404).json({message: "Category not found"});

        res.status(200).json({message: "Category deleted successfully", deletedCategory});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


module.exports = { createCategory, getCategories, getCategory, updateCategory, deleteCategory };