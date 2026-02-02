//user creation & verification
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const jwtSecret = process.env.JWT_SECRET;

const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');


// POST /auth/register - new user
const registerUser = async (req, res, next) => {
    try {
        const { name, email, phoneNumber, password, role } = req.body;
        if (!email)
            return res.status(400).json({message: "Email required"});
        
        const existing = await User.findOne({email});
        if (existing) 
            return res.status(409).json({message: "Email already exists"})

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name, email, phoneNumber, password: hashedPassword, role });
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber,
                role: newUser.role
            }
        });

    } catch (error) {
        next(error);
    }
};


// POST /auth/login 
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email)
            return res.status(400).json({message: "Email required"});

        const user = await User.findOne({email}).select("+password");
        if (!user)
            return res.status(401).json({message: "Invalid credentials"});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({message: "Invalid credentials"});

        const token = jwt.sign({id: user._id, role: user.role}, jwtSecret, {expiresIn: "7d"});
        res.status(200).json({
            message: "Success!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};


// PUT /auth/update-password - logged-in user
const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword)
            return res.status(400).json({message: "Current password and new password required"});

        if (newPassword.length < 6)
            return res.status(400).json({message: "Password must be at least 6 characters"});

        //fetch user from db
        const user = await User.findById(req.user.id).select("+password");

        if (!user)
            return res.status(404).json({messafe: "User not found"});

        //verify current password
        const isMatch = bcrypt.compare(currentPassword, user.password);
        if (!isMatch)
            return res.status(401).json({message: "Current password incorrect"});

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        user.passwordChangedAt = Date.now();

        await user.save();

        res.status(200).json({message: "Password updated successfully"});

    } catch (error) {
        next(error);
    }
};


//auth/forgot-password - reset password via email
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        if (!email)
            return res.status(400).json({message: "Email required"})

        const user = await User.findOne({email});
        if (!user)
            return res.status(404).json({message: "No user found with that email"});

        //generate token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000;  //15minutes in milliseconds
        await user.save();

        //send token via email
        const resetUrl = `${req.protocol}://${req.get("host")}/auth/reset-password/${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            text: `Reset your password using this link: ${resetUrl} \nThis link expires in 15 minutes.`
        });

        res.status(200).json({message: "Password reset email sent"});

    } catch (error) {
        next(error);
    }
};

//auth/reset-password - reset password via token
const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params; //from url
        const newPassword = req.body;

        if (!newPassword)
            return res.status(400).json({message: "New password required"});

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: {$gt: Date.now()}
        });

        if (!user)
            return res.status(400).json({message: "Token invalid or expired"});

        //update new password
        user.password = await bcrypt.hash(newPassword, 10);

        //clear reset token and expiration
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        // Update passwordChangedAt to invalidate old JWTs
        user.passwordChangedAt = Date.now();

        await user.save();

        res.status(200).json({message: "Password has been reset successfully"});

    } catch (error) {
        next(error);
    }
};


module.exports = { registerUser, loginUser, updatePassword, forgotPassword, resetPassword };