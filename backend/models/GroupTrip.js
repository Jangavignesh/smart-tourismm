// ============================================================
// models/GroupTrip.js - FIXED
// Field names match controller exactly
// ============================================================

const mongoose = require("mongoose");

const groupTripSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  creator:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  creatorName: { type: String, required: true },

  members: [{
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name:     { type: String },
    email:    { type: String },
    status:   { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    joinedAt: { type: Date, default: Date.now },
  }],

  destinations: [{
    destinationId:   { type: String },
    destinationName: { type: String },
    image:           { type: String, default: "" },
    city:            { type: String, default: "" },
    addedBy:         { type: String },
    votes:           [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  }],

  invitedEmails: [{ type: String }],
  startDate:     { type: Date },
  endDate:       { type: Date },
  totalBudget:   { type: Number, default: 0 },
  status:        { type: String, enum: ["planning", "confirmed", "completed", "cancelled"], default: "planning" },
  tripCode:      { type: String, unique: true },

}, { timestamps: true });

// Auto generate unique trip code
groupTripSchema.pre("save", function(next) {
  if (!this.tripCode) {
    this.tripCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

groupTripSchema.index({ creator: 1 });
groupTripSchema.index({ "members.user": 1 });
groupTripSchema.index({ tripCode: 1 });

module.exports = mongoose.model("GroupTrip", groupTripSchema);
