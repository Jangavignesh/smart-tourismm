// ============================================================
// backend/models/Place.js - Fallback Places Collection
// Stores predefined places for reliable recommendations
// when the Overpass API returns insufficient results.
// ============================================================

const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "cafe",
        "restaurant",
        "fast_food",
        "hotel",
        "park",
        "bus_station",
        "railway_station",
      ],
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient city + category lookups
placeSchema.index({ city: 1, category: 1 });

module.exports = mongoose.model("Place", placeSchema);
