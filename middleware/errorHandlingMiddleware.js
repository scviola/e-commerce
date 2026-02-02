const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";

    //invalid MongoDB ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }

    //mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(", ");
    }
        
    //duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue[0]);
        message = `${field} already exists`;
    }

    res.status(statusCode).json({success: false, message});
};


module.exports = errorHandler;