// ============================================================
// routes/notificationRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

// GET all notifications for user
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch notifications." });
  }
});

// Mark all as read
router.put("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: "All marked as read." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not update." });
  }
});

// Mark one as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Delete all
router.delete("/clear", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.status(200).json({ success: true, message: "Notifications cleared." });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
