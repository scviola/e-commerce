const express = require('express');
const router = express.Router();

const { createPickupLocation, getPickupLocations, getPickupLocation, updatePickupLocation, deletePickupLocation } = require('../controllers/pickupLocationController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware.js');

//pickup-locations routes
//create pickup location - admin only
router.post("/", protect, authorize("admin"), createPickupLocation);

//get all active pickup locations - public
router.get("/", getPickupLocations);

//get pickup location by location ID - admin only
router.get("/:id", protect, authorize("admin"), getPickupLocation);

//update pickup location - admin only
router.put("/:id", protect, authorize("admin"), updatePickupLocation);

//delete pickup location - admin only
router.delete("/:id", protect, authorize("admin"), deletePickupLocation);


module.exports = router;