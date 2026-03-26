// ============================================================
// src/pages/DashboardPage.js - WITH ANALYTICS
// ============================================================

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CATEGORY_META } from "../components/common/DestinationCard";
import api from "../utils/api";
import toast from "react-hot-toast";

// ── Mini Bar Chart ───────────────────────────────────────────
const BarChart = ({ data, colorClass = "bg-blue-500" }) => {
  const max = Math.max(...Object.values(data), 1);
  return (
    <div className="space-y-2">
      {Object.entries(data).map(([label, value]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-20 text-right flex-shrink-0">{label}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`${colorClass} h-2.5 rounded-full transition-all duration-700`}
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-600 w-6 flex-shrink-0">{value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Stat Card ────────────────────────────────────────────────
const StatCard = ({ emoji, value, label, sublabel, color }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center hover:shadow-md transition-shadow`}>
    <div className="text-3xl mb-2">{emoji}</div>
    <div className={`text-3xl font-bold ${color || "text-slate-800"}`}>{value}</div>
    <div className="text-sm font-medium text-slate-600 mt-0.5">{label}</div>
    {sublabel && <div className="text-xs text-slate-400 mt-0.5">{sublabel}</div>}
  </div>
);

// ── Activity Item ────────────────────────────────────────────
const ActivityItem = ({ item }) => {
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days/7)} week${Math.floor(days/7) > 1 ? "s" : ""} ago`;
    return `${Math.floor(days/30)} month${Math.floor(days/30) > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
        {item.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 truncate">{item.text}</p>
        {item.rating && (
          <p className="text-xs text-amber-500">{"⭐".repeat(item.rating)}</p>
        )}
      </div>
      <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(item.date)}</span>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasPreferences = user?.preferences?.length > 0;
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "";

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/analytics");
      setAnalytics(res.data);
    } catch {
      toast.error("Could not load analytics.");
    } finally {
      setLoading(false);
    }
  };

  const QUICK_LINKS = [
    { to: "/recommendations", emoji: "🎯", title: "AI Recommendations", desc: "Personalized picks", bg: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
    { to: "/explore", emoji: "🗺️", title: "Explore", desc: "Browse destinations", bg: "bg-green-50 border-green-200 hover:bg-green-100" },
    { to: "/group-trips", emoji: "👥", title: "Group Trips", desc: "Plan with friends", bg: "bg-purple-50 border-purple-200 hover:bg-purple-100" },
    { to: "/itinerary", emoji: "✨", title: "AI Itinerary", desc: "Generate trip plan", bg: "bg-amber-50 border-amber-200 hover:bg-amber-100" },
    { to: "/wishlist", emoji: "❤️", title: "Wishlist", desc: "Saved destinations", bg: "bg-red-50 border-red-200 hover:bg-red-100" },
    { to: "/preferences", emoji: "✏️", title: "Preferences", desc: "Update interests", bg: "bg-slate-50 border-slate-200 hover:bg-slate-100" },
  ];

  const stats = analytics?.stats;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}! 👋</h1>
                <p className="text-slate-300 text-sm">{user?.email} · Member since {joinDate}</p>
              </div>
            </div>
            <button onClick={fetchAnalytics}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl border border-white/20 transition-all">
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* No preferences alert */}
        {!hasPreferences && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <span className="text-3xl">⚡</span>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 mb-1">Set your preferences to unlock AI recommendations!</h3>
              <p className="text-amber-700 text-sm mb-3">Tell us what you love and our AI will find perfect destinations.</p>
              <Link to="/preferences" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors">
                🎯 Set My Preferences
              </Link>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_LINKS.map(link => (
              <Link key={link.to} to={link.to}
                className={`flex flex-col items-center text-center gap-2 p-4 rounded-2xl border-2 transition-all ${link.bg}`}>
                <span className="text-3xl">{link.emoji}</span>
                <div>
                  <div className="font-bold text-slate-800 text-xs">{link.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{link.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-slate-100" />)}
          </div>
        ) : stats && (
          <>
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">📊 Your Travel Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard emoji="❤️" value={stats.totalWishlist} label="Wishlist" sublabel="saved destinations" color="text-red-500" />
                <StatCard emoji="⭐" value={stats.totalReviews} label="Reviews" sublabel={stats.avgRating > 0 ? `Avg ${stats.avgRating}★` : "no reviews yet"} color="text-amber-500" />
                <StatCard emoji="👥" value={stats.totalGroups} label="Group Trips" sublabel={`${stats.tripsCreated} created · ${stats.tripsJoined} joined`} color="text-violet-600" />
                <StatCard emoji="💸" value={`₹${stats.totalExpenses.toLocaleString("en-IN")}`} label="Total Spent" sublabel="across group trips" color="text-green-600" />
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Travel Interests */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">🎯 Travel Interests</h3>
                  <Link to="/preferences" className="text-xs text-blue-500 hover:underline">Edit</Link>
                </div>
                {analytics.preferences?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analytics.preferences.map(pref => {
                      const m = CATEGORY_META[pref];
                      return m ? (
                        <span key={pref} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-full border border-blue-200 font-medium">
                          {m.emoji} {m.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No preferences set yet.</p>
                )}
              </div>

              {/* Rating Distribution */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 mb-4">⭐ Your Ratings</h3>
                {stats.totalReviews > 0 ? (
                  <BarChart
                    data={Object.fromEntries(
                      Object.entries(analytics.ratingDist)
                        .reverse()
                        .map(([k, v]) => [`${k} ★`, v])
                    )}
                    colorClass="bg-amber-400"
                  />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-4xl mb-2">⭐</p>
                    <p className="text-sm text-slate-400">No reviews yet!</p>
                    <Link to="/explore" className="text-xs text-blue-500 hover:underline mt-1 block">Explore destinations →</Link>
                  </div>
                )}
              </div>

              {/* Travel Type */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 mb-4">🧳 Travel Style</h3>
                {Object.keys(analytics.travelTypeDist || {}).length > 0 ? (
                  <BarChart data={analytics.travelTypeDist} colorClass="bg-violet-500" />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-4xl mb-2">🧳</p>
                    <p className="text-sm text-slate-400">Write reviews to see your travel style!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 mb-4">🕐 Recent Activity</h3>
                {analytics.recentActivity?.length > 0 ? (
                  <div>
                    {analytics.recentActivity.map((item, i) => (
                      <ActivityItem key={i} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-4xl mb-2">🌟</p>
                    <p className="text-sm text-slate-400">No activity yet — start exploring!</p>
                    <Link to="/explore" className="text-xs text-blue-500 hover:underline mt-1 block">Explore destinations →</Link>
                  </div>
                )}
              </div>

              {/* Expense Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">💸 Expense Breakdown</h3>
                  <Link to="/group-trips" className="text-xs text-blue-500 hover:underline">View trips →</Link>
                </div>
                {Object.keys(analytics.expenseByCat || {}).length > 0 ? (
                  <>
                    <BarChart
                      data={Object.fromEntries(
                        Object.entries(analytics.expenseByCat)
                          .sort(([,a],[,b]) => b - a)
                          .map(([k, v]) => [k.charAt(0).toUpperCase() + k.slice(1), Math.round(v)])
                      )}
                      colorClass="bg-green-500"
                    />
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-sm">
                      <span className="text-slate-500">Total paid by you</span>
                      <span className="font-bold text-green-600">₹{stats.totalExpenses.toLocaleString("en-IN")}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-4xl mb-2">💸</p>
                    <p className="text-sm text-slate-400">No expenses tracked yet!</p>
                    <Link to="/group-trips" className="text-xs text-blue-500 hover:underline mt-1 block">Add group expenses →</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Groups */}
            {analytics.recentGroups?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">👥 Recent Group Trips</h3>
                  <Link to="/group-trips" className="text-xs text-blue-500 hover:underline">View all →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {analytics.recentGroups.map((trip, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">👥</span>
                        <p className="font-semibold text-slate-800 text-sm truncate">{trip.name}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{trip.members} members</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          trip.status === "confirmed" ? "bg-green-100 text-green-700" :
                          trip.status === "completed" ? "bg-blue-100 text-blue-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>{trip.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
