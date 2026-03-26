// ============================================================
// routes/meetingPollRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const { createPoll, getPollByTrip, shareLocation, calculateMeeting, cancelPoll } = require("../controllers/meetingPollController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/",                     createPoll);
router.get("/trip/:tripId",          getPollByTrip);
router.post("/:id/location",         shareLocation);
router.post("/:id/calculate",        calculateMeeting);
router.delete("/:id",                cancelPoll);

module.exports = router;
