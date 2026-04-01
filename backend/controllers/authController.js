// ============================================================
// controllers/authController.js - Register & Login Logic
// ============================================================

const User = require("../models/User");
const { generateToken } = require("../middleware/authMiddleware");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Validation ────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Check if email already registered
    const emailStr = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailStr });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // ── Create User ───────────────────────────────────────
    const user = await User.create({ name, email: emailStr, password });

    // ── Generate JWT ──────────────────────────────────────
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome aboard 🎉",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validation ────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Ensure email is a string
    const emailStr = String(email).toLowerCase().trim();

    // Find user and explicitly include password (select: false by default)
    const user = await User.findOne({ email: emailStr }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare provided password with hashed password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── Generate JWT ──────────────────────────────────────
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}! 👋`,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

module.exports = { register, login };
