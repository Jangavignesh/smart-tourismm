// ============================================================
// src/pages/WishlistPage.js - Favorites / Wishlist
// ============================================================

import { motion } from "framer-motion";
import CardAnimation from "../components/common/CardAnimation";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { favoritesAPI } from "../utils/api";
import DestinationCard from "../components/common/DestinationCard";
import toast from "react-hot-toast";

const WishlistPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoritesAPI.getFavorites();
      setFavorites(res.data.favorites || []);
    } catch {
      toast.error("Could not load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  // When user removes a favorite from the card heart button
  const handleFavoriteChange = (id, isFavorited) => {
    if (!isFavorited) {
      setFavorites((prev) => prev.filter((d) => d._id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-2"
          >
            My Wishlist ❤️
          </motion.h1>
          <p className="text-red-100 text-sm">
            {favorites.length > 0
              ? `${favorites.length} destination${favorites.length > 1 ? "s" : ""} saved`
              : "No destinations saved yet"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {favorites.map((dest, i) => (
                <CardAnimation key={dest._id} index={i}>
                <DestinationCard
                  key={dest._id}
                  destination={dest}
                  initialFavorited={true}
                  onFavoriteChange={handleFavoriteChange}
                />
                </CardAnimation>
              ))}
            </div>
            <p className="text-center text-sm text-slate-400 mt-8">
              Click the ❤️ on any card to remove it from your wishlist.
            </p>
          </>
        ) : (
          // Empty state
          <div className="text-center py-20">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="text-6xl mb-4"
            >
              💔
            </motion.div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Explore destinations and click the ❤️ to save them here!
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
            >
              🗺️ Explore Destinations
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
