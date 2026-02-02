const express = require('express');
const router = express.Router();

const { createCategory, getCategories, getCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware.js');

//categories routes
router.post("/", protect, authorize("admin"), createCategory); //admin only
router.get("/", getCategories);  //public
router.get("/:id", getCategory); //public
router.put("/:id", protect, authorize("admin"), updateCategory); //admin only
router.delete("/:id", protect, authorize("admin"), deleteCategory); //admin only


module.exports = router;