// ============================================================
// models/MeetingPoll.js
// ============================================================

const mongoose = require("mongoose");

const meetingPollSchema = new mongoose.Schema({
  tripId:    { type: mongoose.Schema.Types.ObjectId, ref: "GroupTrip", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdByName: { type: String, required: true },
  status:    { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
  locations: [{
    userId:   { type: String },
    userName: { type: String },
    lat:      { type: Number },
    lng:      { type: Number },
    city:     { type: String, default: "" },
    sharedAt: { type: Date, default: Date.now },
  }],
  result: {
    city:    { type: String, default: "" },
    state:   { type: String, default: "" },
    lat:     { type: Number },
    lng:     { type: Number },
    avgDist: { type: Number },
  },
}, { timestamps: true });

module.exports = mongoose.model("MeetingPoll", meetingPollSchema);
