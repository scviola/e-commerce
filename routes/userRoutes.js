const express = require('express');
const router = express.Router();

const { getUsers, getUser, updateUser, deleteUser, getMe, updateMe } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware.js');


//users
// logged-in user(self)
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

//user mgt
router.get("/", protect, authorize("admin"), getUsers);
router.get("/:id", protect, authorize("admin"), getUser);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);


module.exports = router;