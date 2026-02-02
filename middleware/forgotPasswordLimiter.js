const rateLimit = require("express-rate-limit");

// Limit requests to /forgot-password
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 5, // max 5 requests per IP in windowMs
    message: {
        message: "Too many password reset requests from this IP. Try again after 15 minutes."
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
});

module.exports = forgotPasswordLimiter;
