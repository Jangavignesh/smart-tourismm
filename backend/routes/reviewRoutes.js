// ============================================================
// routes/reviewRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const { addReview, getReviews, updateReview, deleteReview, voteReview, getMyReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.get("/:destinationId", getReviews);

// Protected
router.use(protect);
router.get("/user/my", getMyReviews);
router.post("/", addReview);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);
router.post("/:reviewId/vote", voteReview);

module.exports = router;
