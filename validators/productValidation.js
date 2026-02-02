const { body, param } = require("express-validator");
const mongoose = require("mongoose");

//helper to check for valid mongoDB objectId
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

//create product
const createProductValidation = [
  body("name")
    .notEmpty().withMessage("Product name is required")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("category")
    .notEmpty().withMessage("Category ID is required")
    .custom(isValidObjectId).withMessage("Valid category ID required"),
  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("description")
    .notEmpty().withMessage("Product description is required"),
  body("stockQuantity")
    .notEmpty().withMessage("Stock quantity is required")
    .isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),
  body("images")
    .optional()
    .isArray().withMessage("Images must be an array"),
  body("metadata")
    .optional()
    .isObject().withMessage("Metadata must be an object")
];

//get product by product id
const getProductValidation = [
  param("id")
    .custom(isValidObjectId).withMessage("Valid product ID required")
];

//update product
const updateProductValidation = [
  param("id")
    .custom(isValidObjectId).withMessage("Valid product ID required"),
  body("name")
    .optional()
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("category")
    .optional()
    .custom(isValidObjectId).withMessage("Valid category ID required"),
  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("description")
    .optional()
    .isString().withMessage("Description must be a string"),
  body("stockQuantity")
    .optional()
    .isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),
  body("images")
    .optional()
    .isArray().withMessage("Images must be an array"),
  body("metadata")
    .optional()
    .isObject().withMessage("Metadata must be an object")
];

//delete product
const deleteProductValidation = [
  param("id")
    .custom(isValidObjectId).withMessage("Valid product ID required")
];


module.exports = { createProductValidation, getProductValidation, updateProductValidation, deleteProductValidation };