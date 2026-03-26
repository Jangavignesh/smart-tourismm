// ============================================================
// routes/destinationRoutes.js - With cache refresh route
// ============================================================

const express = require("express");
const router = express.Router();
const {
  getAllDestinations,
  getDestinationById,
  searchDestinations,
  getPopularDestinations,
  getByCategory,
  refreshCache,
} = require("../controllers/destinationController");

router.get("/refresh", refreshCache);
router.get("/search", searchDestinations);
router.get("/popular", getPopularDestinations);
router.get("/bycategory", getByCategory);
router.get("/", getAllDestinations);
router.get("/:id", getDestinationById);

module.exports = router;
