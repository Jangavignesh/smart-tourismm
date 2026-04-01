// ============================================================
// controllers/recommendationController.js
// AI Recommendation Engine - Uses DestinationCache
// ============================================================

const DestinationCache = require("../models/DestinationCache");
const User = require("../models/User");

/**
 * Recommendation Algorithm:
 * Score = (matchCount × 10) + (rating × 2) + popularityBonus
 */

/**
 * @route GET /api/recommendations
 * @desc  Get AI-powered recommendations for logged-in user
 * @access Protected
 */
const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("preferences name");

    if (!user.preferences || user.preferences.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Please set your preferences first!",
        recommendations: [],
        hasPreferences: false,
      });
    }

    const userPrefs = user.preferences;

    // Fetch all destinations from cache
    const allDestinations = await DestinationCache.find().lean();

    if (allDestinations.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No destinations available. Please try again later.",
        recommendations: [],
        hasPreferences: true,
      });
    }

    // ── Scoring Algorithm ─────────────────────────────────
    const scored = allDestinations.map((dest) => {
      const matchCount = (dest.categories || []).filter(cat => userPrefs.includes(cat)).length;
      const matchedCategories = (dest.categories || []).filter(cat => userPrefs.includes(cat));
      const ratingBonus = (dest.rating || 4) * 2;
      const popularityBonus = Math.min((dest.reviewCount || 0) / 1000, 5);
      const totalScore = (matchCount * 10) + ratingBonus + popularityBonus;

      return {
        _id: dest.tripadvisorId || dest._id,
        ...dest,
        score: parseFloat(totalScore.toFixed(2)),
        matchCount,
        matchedCategories,
      };
    });

    // Filter destinations with at least 1 match
    const filtered = scored
      .filter(d => d.matchCount > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    // Fallback to top rated if no matches
    if (filtered.length === 0) {
      const popular = scored
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8)
        .map(d => ({ ...d, score: 0, matchCount: 0, matchedCategories: [] }));

      return res.status(200).json({
        success: true,
        message: "No exact matches. Here are top-rated destinations!",
        recommendations: popular,
        isFallback: true,
        hasPreferences: true,
        userPreferences: userPrefs,
      });
    }

    res.status(200).json({
      success: true,
      message: `Found ${filtered.length} destinations matching your interests! 🎯`,
      recommendations: filtered,
      userPreferences: userPrefs,
      hasPreferences: true,
      isFallback: false,
    });
  } catch (err) {
    console.error("Recommendation Error:", err);
    res.status(500).json({ success: false, message: "Could not fetch recommendations." });
  }
};

/**
 * @route GET /api/recommendations/explore
 * @desc  Get all destinations for explore page
 * @access Public
 */
const exploreDestinations = async (req, res) => {
  try {
    const { category, sort = "rating", limit = 20 } = req.query;

    let query = {};
    if (category && category !== "all") query.categories = category;

    const destinations = await DestinationCache.find(query)
      .sort({ rating: -1 })
      .limit(parseInt(limit))
      .lean();

    const formatted = destinations.map(d => ({
      _id: d.tripadvisorId || d._id,
      ...d,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      destinations: formatted,
    });
  } catch (err) {
    console.error("Explore Error:", err);
    res.status(500).json({ success: false, message: "Could not fetch destinations." });
  }
};

module.exports = { getRecommendations, exploreDestinations };
