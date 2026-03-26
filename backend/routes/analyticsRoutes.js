// ============================================================
// routes/analyticsRoutes.js
// User dashboard analytics
// ============================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Review = require("../models/Review");
const GroupTrip = require("../models/GroupTrip");
const Expense = require("../models/Expense");

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Run all queries in parallel
    const [user, reviews, groupTrips, expenses] = await Promise.all([
      User.findById(userId).select("preferences favorites createdAt name"),
      Review.find({ user: userId }).sort({ createdAt: -1 }),
      GroupTrip.find({ $or: [{ creator: userId }, { "members.user": userId }] }).sort({ createdAt: -1 }),
      Expense.find({ paidBy: userId }).sort({ createdAt: -1 }),
    ]);

    // ── Stats ────────────────────────────────────────────────
    const totalWishlist    = user.favorites?.length || 0;
    const totalReviews     = reviews.length;
    const totalGroups      = groupTrips.length;
    const totalExpenses    = expenses.reduce((s, e) => s + e.amount, 0);
    const avgRating        = reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // ── Preference breakdown ─────────────────────────────────
    const preferences = user.preferences || [];

    // ── Rating distribution ──────────────────────────────────
    const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1; });

    // ── Travel type distribution ─────────────────────────────
    const travelTypeDist = {};
    reviews.forEach(r => {
      const t = r.travelType || "Solo";
      travelTypeDist[t] = (travelTypeDist[t] || 0) + 1;
    });

    // ── Expense by category ──────────────────────────────────
    const expenseByCat = {};
    expenses.forEach(e => {
      expenseByCat[e.category] = (expenseByCat[e.category] || 0) + e.amount;
    });

    // ── Recent activity ──────────────────────────────────────
    const recentActivity = [];

    reviews.slice(0, 3).forEach(r => {
      recentActivity.push({
        type: "review",
        emoji: "⭐",
        text: `Reviewed ${r.destinationName}`,
        rating: r.rating,
        date: r.createdAt,
      });
    });

    groupTrips.slice(0, 3).forEach(t => {
      const isCreator = t.creator?.toString() === userId.toString();
      recentActivity.push({
        type: "group",
        emoji: "👥",
        text: `${isCreator ? "Created" : "Joined"} group trip "${t.name}"`,
        date: t.createdAt,
      });
    });

    // Sort by date
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    // ── Group trip stats ─────────────────────────────────────
    const tripsCreated = groupTrips.filter(t => t.creator?.toString() === userId.toString()).length;
    const tripsJoined  = totalGroups - tripsCreated;

    res.status(200).json({
      success: true,
      stats: {
        totalWishlist,
        totalReviews,
        totalGroups,
        totalExpenses: Math.round(totalExpenses),
        avgRating: parseFloat(avgRating),
        tripsCreated,
        tripsJoined,
        preferencesCount: preferences.length,
      },
      preferences,
      ratingDist,
      travelTypeDist,
      expenseByCat,
      recentActivity: recentActivity.slice(0, 5),
      recentReviews: reviews.slice(0, 3).map(r => ({
        destinationName: r.destinationName,
        rating: r.rating,
        title: r.title,
        date: r.createdAt,
      })),
      recentGroups: groupTrips.slice(0, 3).map(t => ({
        name: t.name,
        members: t.members?.length || 1,
        status: t.status,
        date: t.createdAt,
      })),
    });
  } catch (err) {
    console.error("Analytics error:", err.message);
    res.status(500).json({ success: false, message: "Could not fetch analytics." });
  }
});

module.exports = router;
