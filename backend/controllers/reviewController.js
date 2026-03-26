// ============================================================
// controllers/reviewController.js
// Ratings, Reviews & Voting System
// ============================================================

const Review = require("../models/Review");

/**
 * @route POST /api/reviews
 * @desc  Add a review for a destination
 * @access Protected
 */
const addReview = async (req, res) => {
  try {
    const { destination, destinationName, rating, title, comment, visitedMonth, travelType } = req.body;

    if (!destination || !rating || !title || !comment) {
      return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }

    // Check if user already reviewed this destination
    const existing = await Review.findOne({ destination, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already reviewed this destination." });
    }

    const review = await Review.create({
      destination,
      destinationName,
      user: req.user._id,
      userName: req.user.name,
      rating,
      title,
      comment,
      visitedMonth,
      travelType,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully! 🌟",
      review,
    });
  } catch (err) {
    console.error("Add Review Error:", err);
    res.status(500).json({ success: false, message: "Could not add review." });
  }
};

/**
 * @route GET /api/reviews/:destinationId
 * @desc  Get all reviews for a destination
 * @access Public
 */
const getReviews = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const { sort = "newest" } = req.query;

    const sortOptions = {
      newest:   { createdAt: -1 },
      oldest:   { createdAt: 1 },
      highest:  { rating: -1 },
      lowest:   { rating: 1 },
      popular:  { upvotes: -1 },
    };

    const reviews = await Review.find({ destination: destinationId })
      .sort(sortOptions[sort] || { createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

    res.status(200).json({
      success: true,
      count: reviews.length,
      avgRating: parseFloat(avgRating),
      distribution,
      reviews,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch reviews." });
  }
};

/**
 * @route PUT /api/reviews/:reviewId
 * @desc  Update own review
 * @access Protected
 */
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const { rating, title, comment, visitedMonth, travelType } = req.body;
    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.visitedMonth = visitedMonth || review.visitedMonth;
    review.travelType = travelType || review.travelType;
    await review.save();

    res.status(200).json({ success: true, message: "Review updated!", review });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not update review." });
  }
};

/**
 * @route DELETE /api/reviews/:reviewId
 * @desc  Delete own review
 * @access Protected
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    await review.deleteOne();
    res.status(200).json({ success: true, message: "Review deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not delete review." });
  }
};

/**
 * @route POST /api/reviews/:reviewId/vote
 * @desc  Upvote or downvote a review
 * @access Protected
 */
const voteReview = async (req, res) => {
  try {
    const { type } = req.body; // "up" or "down"
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });

    const userId = req.user._id;
    const hasUpvoted   = review.upvotes.includes(userId);
    const hasDownvoted = review.downvotes.includes(userId);

    if (type === "up") {
      if (hasUpvoted) {
        // Remove upvote (toggle off)
        review.upvotes = review.upvotes.filter(id => id.toString() !== userId.toString());
      } else {
        // Add upvote, remove downvote if exists
        review.upvotes.push(userId);
        review.downvotes = review.downvotes.filter(id => id.toString() !== userId.toString());
      }
    } else if (type === "down") {
      if (hasDownvoted) {
        // Remove downvote (toggle off)
        review.downvotes = review.downvotes.filter(id => id.toString() !== userId.toString());
      } else {
        // Add downvote, remove upvote if exists
        review.downvotes.push(userId);
        review.upvotes = review.upvotes.filter(id => id.toString() !== userId.toString());
      }
    }

    await review.save();

    res.status(200).json({
      success: true,
      upvotes: review.upvotes.length,
      downvotes: review.downvotes.length,
      userVote: review.upvotes.includes(userId) ? "up" : review.downvotes.includes(userId) ? "down" : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not vote." });
  }
};

/**
 * @route GET /api/reviews/user/my
 * @desc  Get all reviews by logged in user
 * @access Protected
 */
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch your reviews." });
  }
};

module.exports = { addReview, getReviews, updateReview, deleteReview, voteReview, getMyReviews };
