// ============================================================
// controllers/userController.js - User Profile & Preferences
// ============================================================

const User = require("../models/User");

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Protected
 */
const getProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware protect()
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ success: false, message: "Could not fetch profile." });
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update user name
 * @access  Protected
 */
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Please provide a valid name." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ success: false, message: "Could not update profile." });
  }
};

/**
 * @route   POST /api/users/preferences
 * @desc    Save or update user travel preferences
 * @access  Protected
 */
const savePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    // Validate preferences is an array
    if (!Array.isArray(preferences)) {
      return res.status(400).json({
        success: false,
        message: "Preferences must be an array.",
      });
    }

    const validCategories = ["nature", "adventure", "food", "historical", "hill_stations", "beach", "culture", "wildlife"];

    // Filter out invalid categories
    const filteredPrefs = preferences.filter((p) => validCategories.includes(p));

    if (filteredPrefs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one valid preference.",
      });
    }

    // Update user preferences in DB
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: filteredPrefs },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Preferences saved! Getting your recommendations... 🌍",
      preferences: user.preferences,
    });
  } catch (err) {
    console.error("Save Preferences Error:", err);
    res.status(500).json({ success: false, message: "Could not save preferences." });
  }
};

/**
 * @route   GET /api/users/preferences
 * @desc    Get current user's preferences
 * @access  Protected
 */
const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("preferences");

    res.status(200).json({
      success: true,
      preferences: user.preferences,
    });
  } catch (err) {
    console.error("Get Preferences Error:", err);
    res.status(500).json({ success: false, message: "Could not fetch preferences." });
  }
};

module.exports = { getProfile, updateProfile, savePreferences, getPreferences };
