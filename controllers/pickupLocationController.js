const PickupLocation = require('../models/PickupLocation');

//CRUD
// POST/ - create pickup location - admin only
const createPickupLocation = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        const { name, address, city, isActive } = req.body;

        if (!name || !address || !city)
            return res.status(400).json({message: "Name, address and city are required"});

        const location = await PickupLocation.create({name, address, city, isActive});

        res.status(201).json({message: "Pickup location created successfully", location});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// GET/ - get all pickup locations  - public
const getPickupLocations = async (req, res) => {
    try {
        const locations = await PickupLocation.find({isActive: true});

        if (!locations || locations.length === 0)
            return res.status(204).json({message: "No pickup locations available"});

        res.status(200).json(locations);

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

//GET/:id - get pickup location by ID - admin only
const getPickupLocation = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({message: "Invalid pickup location ID"});

        const location = await PickupLocation.findById(id);
        if (!location)
            return res.status(404).json({message: "Pickup location not found"});

        res.status(200).json(location);

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// PUT/:id - update pickup location - admin only
const updatePickupLocation = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ message: "Access denied" });

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({message: "Invalid pickup location ID"});

        const allowedFields = ["name", "address", "city", "isActive"];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field])
                updates[field] = req.body[field];
        });

        const updatedLocation = await PickupLocation.findByIdAndUpdate(
            id,
            updates,
            {new: true, runValidators: true}
        );

        if (!updatedLocation)
            return res.status(404).json({message: "Pickup location not found"});

        res.status(200).json({message: "Pickup location updated successfully", updatedLocation});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// DELETE/:id - delete pickup location - admin only
const deletePickupLocation = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({message: "Access denied"});

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({message: "Invalid pickup location ID"});

        const deletedLocation = await PickupLocation.findByIdAndDelete(id);
        if (!deletedLocation)
            return res.status(404).json({message: "Pickup location not found"});

        res.status(200).json({message: "Pickup location deleted", deletedLocation});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

module.exports = { createPickupLocation, getPickupLocations, getPickupLocation, updatePickupLocation, deletePickupLocation };