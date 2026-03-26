// ============================================================
// models/Destination.js - Advanced Destination Schema
// ============================================================

const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "India" },
      region: { type: String, enum: ["North", "South", "East", "West", "Central", "Northeast", "Islands"], required: true },
    },
    description: { type: String, required: true },
    shortDescription: { type: String },
    categories: {
      type: [String],
      enum: ["nature", "adventure", "food", "historical", "hill_stations", "beach", "culture", "wildlife", "pilgrimage", "luxury", "offbeat"],
      required: true,
    },
    image: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 4.0 },
    reviewCount: { type: Number, default: 0 },
    bestTimeToVisit: { type: String },
    entryFee: { type: String, default: "Free" },
    popularActivities: { type: [String], default: [] },

    // ── NEW ADVANCED FIELDS ──────────────────────────────
    budget: {
      budget: { type: String },    // e.g. "₹500-800/day"
      midRange: { type: String },  // e.g. "₹1500-3000/day"
      luxury: { type: String },    // e.g. "₹5000+/day"
    },
    nearbyAirports: { type: [String], default: [] },
    languagesSpoken: { type: [String], default: [] },
    bestHotels: {
      type: [{
        name: { type: String },
        priceRange: { type: String },
        type: { type: String },
      }],
      default: [],
    },
    weather: {
      summer: { type: String },
      winter: { type: String },
      monsoon: { type: String },
      bestSeason: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

destinationSchema.index({ categories: 1 });
destinationSchema.index({ rating: -1 });
destinationSchema.index({ "location.region": 1 });

const Destination = mongoose.model("Destination", destinationSchema);
module.exports = Destination;
