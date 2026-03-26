// ============================================================
// models/DestinationCache.js
// Caches TripAdvisor destinations in MongoDB
// ============================================================

const mongoose = require("mongoose");

const destinationCacheSchema = new mongoose.Schema({
  tripadvisorId:  { type: String, required: true, unique: true },
  name:           { type: String, required: true },
  citySource:     { type: String, default: "" },
  location: {
    city:    { type: String, default: "India" },
    state:   { type: String, default: "India" },
    country: { type: String, default: "India" },
  },
  description:      { type: String, default: "" },
  shortDescription: { type: String, default: "" },
  categories:       { type: [String], default: ["culture"] },
  image:            { type: String, required: true },
  rating:           { type: Number, default: 4.0 },
  reviewCount:      { type: Number, default: 0 },
  bestTimeToVisit:  { type: String, default: "October to March" },
  entryFee:         { type: String, default: "Check locally" },
  popularActivities:{ type: [String], default: [] },
  tripAdvisorUrl:   { type: String, default: "" },
  rankingString:    { type: String, default: "" },
  phone:            { type: String, default: "" },
  address:          { type: String, default: "" },
  source:           { type: String, default: "TripAdvisor" },
  fetchedAt:        { type: Date, default: Date.now },
}, { timestamps: true });

destinationCacheSchema.index({ categories: 1 });
destinationCacheSchema.index({ rating: -1 });
destinationCacheSchema.index({ citySource: 1 });
destinationCacheSchema.index({ tripadvisorId: 1 });
destinationCacheSchema.index({ fetchedAt: 1 });

module.exports = mongoose.model("DestinationCache", destinationCacheSchema);
