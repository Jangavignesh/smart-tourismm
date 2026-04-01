// ============================================================
// models/Message.js - FIXED
// tripId and sender are flexible
// ============================================================

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  tripId:     { type: String, required: true }, // String not ObjectId - more flexible
  sender:     { type: String, default: "" },    // String not ObjectId
  senderName: { type: String, required: true, default: "User" },
  text:       { type: String, required: true, maxlength: 1000 },
  type:       { type: String, enum: ["text", "system"], default: "text" },
}, { timestamps: true });

messageSchema.index({ tripId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
