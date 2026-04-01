// ============================================================
// routes/favoritesRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites } = require("../controllers/favoritesController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // All favorites routes require auth

// GET    /api/favorites          - Get all favorites
// POST   /api/favorites/:id      - Add to favorites
// DELETE /api/favorites/:id      - Remove from favorites
router.get("/", getFavorites);
router.post("/:destinationId", addFavorite);
router.delete("/:destinationId", removeFavorite);

module.exports = router;
