// ============================================================
// routes/recommendationRoutes.js
// ============================================================
const express = require("express");
const router = express.Router();
const { getRecommendations, exploreDestinations } = require("../controllers/recommendationController");
const { protect } = require("../middleware/authMiddleware");

// GET /api/recommendations         - Protected: personalized recommendations
// GET /api/recommendations/explore - Public: browse all destinations
router.get("/explore", exploreDestinations);
router.get("/", protect, getRecommendations);

module.exports = router;
