// ============================================================
// models/Notification.js
// ============================================================

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type:       { type: String, enum: ["group_message", "group_edit", "member_joined", "expense_added", "meeting_poll", "trip_invite"], required: true },
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  link:       { type: String, default: "" },
  isRead:     { type: Boolean, default: false },
  tripId:     { type: mongoose.Schema.Types.ObjectId, ref: "GroupTrip" },
  triggeredBy:{ type: String, default: "" },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
