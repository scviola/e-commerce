const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updatePassword, forgotPassword, resetPassword } = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');
const forgotPasswordLimiter = require('../middleware/forgotPasswordLimiter');
const { registerValidation, loginValidation, updatePasswordValidation, forgotPasswordValidation, resetPasswordValidation  } = require('../validators/authValidation');
const validateRequest = require('../middleware/validateRequest');


//auth
router.post("/register", registerValidation, validateRequest, registerUser);
router.post("/login", loginValidation, validateRequest, loginUser);

//logged-in user updates password
router.put("/update-password", protect, updatePasswordValidation, validateRequest, updatePassword);

//forgot password
router.post("/forgot-password", forgotPasswordLimiter, forgotPasswordValidation, validateRequest, forgotPassword);

//reset password
router.put("/reset-password", resetPasswordValidation, validateRequest, resetPassword);

module.exports = router;