// ============================================================
// models/Review.js - Ratings & Reviews + Voting System
// ============================================================

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  destination: {
    type: String, // tripadvisorId
    required: true,
  },
  destinationName: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  // Voting system
  upvotes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  downvotes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  visitedMonth: {
    type: String, // e.g. "January 2024"
    default: "",
  },
  travelType: {
    type: String,
    enum: ["Solo", "Couple", "Family", "Friends", "Business"],
    default: "Solo",
  },
}, { timestamps: true });

// Index for fast queries
reviewSchema.index({ destination: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });

module.exports = mongoose.model("Review", reviewSchema);
