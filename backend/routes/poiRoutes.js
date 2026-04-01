// ============================================================
// backend/routes/poiRoutes.js
// ============================================================
const express = require("express");
const router = express.Router();
const poiController = require("../controllers/poiController");

// We don't necessarily need authentication on this endpoint, but if required we can add proxyMiddleware
router.post("/nearby", poiController.getNearbyPlaces);

// ── Admin Endpoints (Seeding / Management) ──────────────────
router.post("/places", poiController.addPlace);
router.get("/places", poiController.getAllPlaces);

module.exports = router;
