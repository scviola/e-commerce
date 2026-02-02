const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProduct, updateProduct, deleteProduct } = require('../controllers/productController');

const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware.js');
const { createProductValidation, getProductValidation, updateProductValidation, deleteProductValidation } = require('../validators/productValidation.js');
const validateRequest = require('../middleware/validateRequest.js');


//products
router.post("/", protect, authorize("admin"), createProductValidation, validateRequest, createProduct); //admin only
router.get("/", getProducts); //public
router.get("/:id", getProductValidation, validateRequest, getProduct); //public
router.put("/:id", protect, authorize("admin"), updateProductValidation, validateRequest, updateProduct); //admin only
router.delete("/:id", protect, authorize("admin"), deleteProductValidation, validateRequest, deleteProduct);  //admin only


module.exports = router;