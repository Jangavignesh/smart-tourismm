// ============================================================
// routes/userRoutes.js - User Profile & Preferences Routes
// ============================================================

const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, savePreferences, getPreferences } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// All routes below require authentication (JWT)
router.use(protect);

// GET  /api/users/profile  - Get profile
// PUT  /api/users/profile  - Update profile
router.route("/profile").get(getProfile).put(updateProfile);

// POST /api/users/preferences  - Save preferences
// GET  /api/users/preferences  - Get preferences
router.route("/preferences").get(getPreferences).post(savePreferences);

module.exports = router;
