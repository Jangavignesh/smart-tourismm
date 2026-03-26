// ============================================================
// middleware/authMiddleware.js - JWT Protection Middleware
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect - Middleware to verify JWT token and attach user to request
 * Usage: Add as middleware to any protected route
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided. Please log in.",
      });
    }

    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from decoded token ID
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // Attach user to request object for use in controllers
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    return res.status(500).json({ success: false, message: "Authentication error." });
  }
};

/**
 * generateToken - Helper to create JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = { protect, generateToken };
