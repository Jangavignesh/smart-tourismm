// ============================================================
// src/components/common/DestinationCard.js
// ============================================================

import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { favoritesAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Map category IDs to display labels and emoji
const CATEGORY_META = {
  nature: { label: "Nature", emoji: "🌿", color: "bg-green-100 text-green-700" },
  adventure: { label: "Adventure", emoji: "🧗", color: "bg-orange-100 text-orange-700" },
  food: { label: "Food", emoji: "🍛", color: "bg-yellow-100 text-yellow-700" },
  historical: { label: "Historical", emoji: "🏛️", color: "bg-purple-100 text-purple-700" },
  hill_stations: { label: "Hill Station", emoji: "⛰️", color: "bg-sky-100 text-sky-700" },
  beach: { label: "Beach", emoji: "🏖️", color: "bg-cyan-100 text-cyan-700" },
  culture: { label: "Culture", emoji: "🎭", color: "bg-pink-100 text-pink-700" },
  wildlife: { label: "Wildlife", emoji: "🐯", color: "bg-amber-100 text-amber-700" },
};

const StarRating = ({ rating }) => {
  const stars = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= stars ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
};

const DestinationCard = ({ destination, showScore = false, matchedCategories = [], initialFavorited = false, onFavoriteChange }) => {
  const [imgError, setImgError] = useState(false);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favLoading, setFavLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const fallbackImg = `https://picsum.photos/seed/${encodeURIComponent(destination.name)}/800/600`;

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { toast.error("Please login to save favorites!"); return; }
    setFavLoading(true);
    try {
      if (favorited) {
        await favoritesAPI.removeFavorite(destination._id);
        toast.success("Removed from wishlist");
        setFavorited(false);
      } else {
        await favoritesAPI.addFavorite(destination._id);
        toast.success(`${destination.name} saved to wishlist! ❤️`);
        setFavorited(true);
      }
      if (onFavoriteChange) onFavoriteChange(destination._id, !favorited);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update wishlist");
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={imgError ? fallbackImg : destination.image}
          alt={destination.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Score badge */}
        {showScore && destination.matchCount > 0 && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            {destination.matchCount} match{destination.matchCount > 1 ? "es" : ""}
          </div>
        )}
        {/* Favorite heart button — Animated */}
        <motion.button
          onClick={handleFavorite}
          disabled={favLoading}
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.15 }}
          className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${
            favorited ? "bg-red-500 text-white" : "bg-white/90 text-slate-400 hover:text-red-500"
          }`}
        >
          {favLoading ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <AnimatePresence mode="wait">
              {favorited ? (
                <motion.svg
                  key="favorited"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: [1.4, 0.9, 1.1, 1], rotate: 0 }}
                  exit={{ scale: 0, rotate: 30 }}
                  transition={{ duration: 0.4, times: [0, 0.4, 0.7, 1] }}
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="unfavorited"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </motion.svg>
              )}
            </AnimatePresence>
          )}
        </motion.button>
        {/* Rating overlay */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
          <StarRating rating={destination.rating} />
          <span className="text-xs font-semibold text-slate-700">{destination.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-blue-600 transition-colors">
            {destination.name}
          </h3>
        </div>

        <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {destination.location.city}, {destination.location.state}
        </p>

        <p className="text-sm text-slate-500 leading-relaxed mb-3 flex-1 line-clamp-2">
          {destination.shortDescription || destination.description}
        </p>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {destination.categories.slice(0, 3).map((cat) => {
            const meta = CATEGORY_META[cat] || { label: cat, emoji: "📍", color: "bg-slate-100 text-slate-600" };
            const isMatched = matchedCategories.includes(cat);
            return (
              <span
                key={cat}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color} ${isMatched ? "ring-2 ring-blue-400 ring-offset-1" : ""}`}
              >
                {meta.emoji} {meta.label}
              </span>
            );
          })}
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-50">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {destination.bestTimeToVisit}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {destination.reviewCount.toLocaleString()} reviews
          </span>
        </div>
      </div>
    </div>
  );
};

export { CATEGORY_META };
export default DestinationCard;
