// ============================================================
// src/pages/HomePage.js - Landing Page
// ============================================================

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { recommendationAPI } from "../utils/api";
import DestinationCard from "../components/common/DestinationCard";

const STATS = [
  { value: "25+", label: "Destinations" },
  { value: "8", label: "Categories" },
  { value: "AI", label: "Powered" },
  { value: "Free", label: "Always" },
];

const FEATURES = [
  { icon: "🤖", title: "AI Recommendations", desc: "Smart matching engine ranks destinations based on your unique travel interests." },
  { icon: "🗺️", title: "Explore India", desc: "From Himalayan peaks to tropical beaches — discover every corner of incredible India." },
  { icon: "🔒", title: "Secure & Private", desc: "JWT authentication and bcrypt password hashing keep your account safe." },
  { icon: "🚀", title: "Group Planning", desc: "Plan trips with friends — real-time chat, location sharing, meeting point finder." },
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await recommendationAPI.exploreDestinations({ limit: 3, sort: "rating" });
        setFeatured(res.data.destinations || []);
      } catch {
        // silently fail
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              AI-Powered Tourism Platform
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Discover India
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Smarter. Better.
              </span>
            </h1>

            <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-xl">
              Our AI recommendation engine matches your travel preferences with India's most incredible destinations — from misty hill stations to ancient temples.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/recommendations"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    🎯 My Recommendations
                  </Link>
                  <Link
                    to="/explore"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all"
                  >
                    🗺️ Explore All
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25"
                  >
                    🚀 Get Started Free
                  </Link>
                  <Link
                    to="/explore"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all"
                  >
                    🗺️ Explore Destinations
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/10 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Why SmartTrip?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Everything you need to plan the perfect trip — powered by AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Rated Destinations Preview ──────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Top Rated Destinations</h2>
              <p className="text-slate-500">Highest-rated places loved by thousands of travellers.</p>
            </div>
            <Link to="/explore" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all →
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((dest) => (
                <DestinationCard key={dest._id} destination={dest} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            {isAuthenticated ? (
              <Link
                to="/preferences"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                🎯 Get My Personalized Picks
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                🚀 Sign Up for AI Recommendations
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Future Scope Section ─────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-blue-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Group Trip Planning</h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-10">
            Plan trips with your crew — real-time chat, live location sharing, and an AI that finds the perfect meeting point for everyone.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {["💬 Real-time Chat", "📍 Live Location", "🤝 Meeting Point Finder", "🌐 Group Rooms"].map((f) => (
              <div key={f} className="bg-white/10 rounded-xl p-4 text-sm text-slate-300 border border-white/10">{f}</div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              to="/group-trips"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              👥 Go to Group Trips
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>© {new Date().getFullYear()} SmartTrip</p>
      </footer>
    </div>
  );
};

export default HomePage;


