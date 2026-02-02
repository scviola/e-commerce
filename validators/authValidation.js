const { body } = require("express-validator");

//register
const registerValidation = [
  body("name")
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),
  body("email")
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage("Valid email required"),
  body("password")
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

//login
const loginValidation = [
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Valid email required"),
  body("password")
    .notEmpty().withMessage("Password is required")
];

//logged-in user
const updatePasswordValidation = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required")
    .isLength({ min: 6 }).withMessage("Old password must be at least 6 characters"),
  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
];

//send reset email
const forgotPasswordValidation = [
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Valid email required")
];

//via token
const resetPasswordValidation = [
  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
];

module.exports = { registerValidation, loginValidation, updatePasswordValidation, forgotPasswordValidation, resetPasswordValidation };