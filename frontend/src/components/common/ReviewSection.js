// ============================================================
// src/components/common/ReviewSection.js
// Ratings, Reviews & Voting System
// ============================================================

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import toast from "react-hot-toast";

const TRAVEL_TYPES = ["Solo", "Couple", "Family", "Friends", "Business"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(s => (
      <button key={s} type="button" onClick={() => onChange(s)}>
        <svg className={`w-7 h-7 transition-colors ${s <= value ? "text-amber-400" : "text-slate-200 hover:text-amber-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </button>
    ))}
    <span className="ml-2 text-sm font-medium text-slate-600 self-center">
      {["","Poor","Fair","Good","Very Good","Excellent"][value] || ""}
    </span>
  </div>
);

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </div>
);

const ReviewSection = ({ destination }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [distribution, setDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    rating: 0, title: "", comment: "",
    visitedMonth: "", travelType: "Solo",
  });

  const destinationId = destination?._id || destination?.tripadvisorId;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reviews/${destinationId}?sort=${sortBy}`);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.avgRating || 0);
      setDistribution(res.data.distribution || {});
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (destinationId) fetchReviews(); }, [destinationId, sortBy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { toast.error("Please select a rating!"); return; }
    if (!form.title.trim()) { toast.error("Please add a title!"); return; }
    if (!form.comment.trim()) { toast.error("Please write a review!"); return; }

    setSubmitting(true);
    try {
      await api.post("/reviews", {
        destination: destinationId,
        destinationName: destination?.name,
        ...form,
      });
      toast.success("Review submitted! 🌟");
      setForm({ rating: 0, title: "", comment: "", visitedMonth: "", travelType: "Solo" });
      setShowForm(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (reviewId, type) => {
    if (!isAuthenticated) { toast.error("Please login to vote!"); return; }
    try {
      const res = await api.post(`/reviews/${reviewId}/vote`, { type });
      setReviews(prev => prev.map(r =>
        r._id === reviewId
          ? { ...r, upvotes: Array(res.data.upvotes).fill(null), downvotes: Array(res.data.downvotes).fill(null), userVote: res.data.userVote }
          : r
      ));
    } catch { toast.error("Could not vote."); }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success("Review deleted.");
      fetchReviews();
    } catch { toast.error("Could not delete."); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white">
        <h3 className="font-bold text-xl">⭐ Ratings & Reviews</h3>
        <p className="text-amber-100 text-sm mt-0.5">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""} from travellers
        </p>
      </div>

      <div className="p-5 space-y-5">

        {/* Rating Summary */}
        {reviews.length > 0 && (
          <div className="flex gap-6 items-center bg-amber-50 rounded-2xl p-4 border border-amber-100">
            {/* Average */}
            <div className="text-center min-w-[80px]">
              <p className="text-5xl font-bold text-amber-500">{avgRating}</p>
              <StarDisplay rating={avgRating} />
              <p className="text-xs text-slate-400 mt-1">{reviews.length} reviews</p>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 space-y-1.5">
              {[5,4,3,2,1].map(star => {
                const count = distribution[star] || 0;
                const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-4">{star}★</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-6">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sort + Write Review buttons */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {["newest","highest","popular"].map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortBy === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {isAuthenticated && (
            <button onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors">
              {showForm ? "✕ Cancel" : "✍️ Write a Review"}
            </button>
          )}
          {!isAuthenticated && (
            <p className="text-xs text-slate-400">Login to write a review</p>
          )}
        </div>

        {/* Review Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-800">Your Review</h4>

            {/* Star Rating */}
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-2">Your Rating *</label>
              <StarPicker value={form.rating} onChange={(v) => setForm(p => ({ ...p, rating: v }))} />
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1.5">Title *</label>
              <input
                type="text" maxLength={100}
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Summarize your experience..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1.5">Review *</label>
              <textarea
                rows={4} maxLength={1000}
                value={form.comment}
                onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                placeholder="Share your experience in detail..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
              <p className="text-xs text-slate-400 text-right mt-1">{form.comment.length}/1000</p>
            </div>

            {/* Travel info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1.5">When did you visit?</label>
                <select value={form.visitedMonth} onChange={e => setForm(p => ({ ...p, visitedMonth: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400">
                  <option value="">Select month</option>
                  {MONTHS.map(m => <option key={m}>{m} 2024</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1.5">Travel type</label>
                <select value={form.travelType} onChange={e => setForm(p => ({ ...p, travelType: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400">
                  {TRAVEL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              {submitting ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting...</> : "Submit Review ⭐"}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                {/* Review header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
                      {review.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{review.userName}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StarDisplay rating={review.rating} />
                        {review.travelType && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{review.travelType}</span>
                        )}
                        {review.visitedMonth && (
                          <span className="text-xs text-slate-400">{review.visitedMonth}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>

                {/* Review content */}
                <h4 className="font-semibold text-slate-800 text-sm mb-1">{review.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>

                {/* Voting + Delete */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Helpful?</span>
                    {/* Upvote */}
                    <button onClick={() => handleVote(review._id, "up")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        review.userVote === "up"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-600"
                      }`}>
                      👍 {review.upvotes?.length || 0}
                    </button>
                    {/* Downvote */}
                    <button onClick={() => handleVote(review._id, "down")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        review.userVote === "down"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
                      }`}>
                      👎 {review.downvotes?.length || 0}
                    </button>
                  </div>

                  {/* Delete own review */}
                  {user && review.user === user._id && (
                    <button onClick={() => handleDelete(review._id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📝</div>
            <h4 className="font-semibold text-slate-700 mb-1">No reviews yet</h4>
            <p className="text-slate-400 text-sm">Be the first to review {destination?.name}!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
