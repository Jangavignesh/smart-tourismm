// ============================================================
// routes/groupTripRoutes.js - V2 with invite by email
// ============================================================

const express = require("express");
const router = express.Router();
const {
  createGroupTrip,
  getMyTrips,
  getTripById,
  joinTrip,
  addDestination,
  voteDestination,
  updateTrip,
  deleteTrip,
  removeDestination,
  inviteByEmail,
  leaveTrip,
} = require("../controllers/groupTripController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/",    getMyTrips);
router.post("/",   createGroupTrip);
router.post("/join", joinTrip);
router.get("/:id",   getTripById);
router.put("/:id",   updateTrip);
router.delete("/:id", deleteTrip);
router.post("/:id/destinations",              addDestination);
router.delete("/:id/destinations/:destId",    removeDestination);
router.post("/:id/destinations/:destId/vote", voteDestination);
router.post("/:id/invite-by-email",           inviteByEmail);
router.delete("/:id/leave",                   leaveTrip);       // ← NEW

module.exports = router;
