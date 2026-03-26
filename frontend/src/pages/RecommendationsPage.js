// ============================================================
// src/pages/RecommendationsPage.js - WITH EXPLAINABLE AI
// Shows WHY each destination was recommended
// ============================================================

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { recommendationAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import DestinationCard, { CATEGORY_META } from "../components/common/DestinationCard";
import toast from "react-hot-toast";

// ── AI Explanation Card ──────────────────────────────────────
const AIExplanation = ({ dest, userPrefs }) => {
  const [expanded, setExpanded] = useState(false);

  const matchedCats = dest.matchedCategories || [];
  const unmatchedCats = (dest.categories || []).filter(c => !matchedCats.includes(c));
  const matchPct = userPrefs.length > 0 ? Math.round((matchedCats.length / userPrefs.length) * 100) : 0;
  const ratingScore = Math.round((dest.rating / 5) * 100);

  // Overall match strength
  const strength = matchPct >= 80 ? { label: "Perfect Match", color: "text-green-600", bg: "bg-green-50", border: "border-green-200", emoji: "🎯" }
    : matchPct >= 50 ? { label: "Great Match", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", emoji: "✅" }
    : matchPct >= 30 ? { label: "Good Match", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", emoji: "👍" }
    : { label: "Partial Match", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", emoji: "💡" };

  return (
    <div className={`rounded-xl border ${strength.border} ${strength.bg} overflow-hidden`}>
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{strength.emoji}</span>
          <span className={`text-sm font-bold ${strength.color}`}>{strength.label}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full bg-white border ${strength.border} ${strength.color} font-semibold`}>
            {matchPct}% match
          </span>
        </div>
        <span className={`text-xs ${strength.color} font-medium`}>
          {expanded ? "▲ hide" : "▼ why?"}
        </span>
      </button>

      {/* Expanded explanation */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/50">

          {/* Match score bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Preference Match</span>
              <span className="font-bold">{matchPct}%</span>
            </div>
            <div className="bg-white rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${matchPct >= 80 ? "bg-green-500" : matchPct >= 50 ? "bg-blue-500" : "bg-amber-500"}`}
                style={{ width: `${matchPct}%` }}
              />
            </div>
          </div>

          {/* Matched preferences */}
          {matchedCats.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">✅ Matches your interests:</p>
              <div className="flex flex-wrap gap-1.5">
                {matchedCats.map(cat => {
                  const m = CATEGORY_META[cat];
                  return m ? (
                    <span key={cat} className="flex items-center gap-1 text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded-lg font-medium">
                      {m.emoji} {m.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Unmatched categories */}
          {unmatchedCats.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">➕ Also offers:</p>
              <div className="flex flex-wrap gap-1.5">
                {unmatchedCats.map(cat => {
                  const m = CATEGORY_META[cat];
                  return m ? (
                    <span key={cat} className="flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded-lg">
                      {m.emoji} {m.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Score breakdown */}
          <div className="bg-white rounded-xl p-3 space-y-2 border border-white">
            <p className="text-xs font-bold text-slate-600">📊 AI Score Breakdown:</p>
            <div className="space-y-1.5">
              {/* Preference score */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-32">Preference match</span>
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (matchedCats.length * 10 / 20) * 100)}%` }} />
                </div>
                <span className="text-xs font-bold text-blue-600">{matchedCats.length * 10}</span>
              </div>
              {/* Rating score */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-32">Rating bonus</span>
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${ratingScore}%` }} />
                </div>
                <span className="text-xs font-bold text-amber-600">{(dest.rating * 2).toFixed(1)}</span>
              </div>
              {/* Popularity score */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-32">Popularity</span>
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (dest.reviewCount / 500) * 100)}%` }} />
                </div>
                <span className="text-xs font-bold text-purple-600">{Math.min(5, (dest.reviewCount / 100)).toFixed(1)}</span>
              </div>
              {/* Total */}
              <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-600">Total AI Score</span>
                <span className="text-sm font-bold text-violet-700">{dest.score}</span>
              </div>
            </div>
          </div>

          {/* AI reasoning text */}
          <div className="bg-white rounded-xl p-3 border border-white">
            <p className="text-xs font-bold text-slate-600 mb-1">🤖 AI Reasoning:</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {matchedCats.length > 0
                ? `${dest.name} was recommended because it matches ${matchedCats.length} of your ${userPrefs.length} preferences (${matchedCats.map(c => CATEGORY_META[c]?.label || c).join(", ")}). With a rating of ${dest.rating}⭐ and ${dest.reviewCount} reviews, it scores ${dest.score} points overall.`
                : `${dest.name} is a top-rated destination (${dest.rating}⭐) with ${dest.reviewCount} reviews. It's shown as a popular pick since no exact preference matches were found.`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────
const RecommendationsPage = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ message: "", hasPreferences: false, isFallback: false, userPreferences: [] });
  const [filter, setFilter] = useState("all");
  const [showXAI, setShowXAI] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRecommendations(); }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await recommendationAPI.getRecommendations();
      setRecommendations(res.data.recommendations || []);
      setMeta({
        message: res.data.message,
        hasPreferences: res.data.hasPreferences,
        isFallback: res.data.isFallback,
        userPreferences: res.data.userPreferences || [],
      });
    } catch {
      toast.error("Failed to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "all"
    ? recommendations
    : recommendations.filter(d => d.categories.includes(filter));

  const userPrefs = meta.userPreferences || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-blue-200 text-sm font-medium">AI-Powered</p>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full border border-white/30">
                  🧠 Explainable AI
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Your Travel Picks, {user?.name?.split(" ")[0]} 🎯</h1>
              <p className="text-blue-200 text-sm">{meta.message}</p>

              {userPrefs.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {userPrefs.map(pref => {
                    const m = CATEGORY_META[pref];
                    return m ? (
                      <span key={pref} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full border border-white/30">
                        {m.emoji} {m.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              {/* Toggle XAI */}
              <button
                onClick={() => setShowXAI(!showXAI)}
                className={`px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${showXAI ? "bg-white text-blue-700 border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}
              >
                🧠 {showXAI ? "Hide" : "Show"} AI Explanations
              </button>
              <Link to="/preferences" className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl border border-white/20 transition-all">
                ✏️ Edit Preferences
              </Link>
              <button onClick={fetchRecommendations} className="px-4 py-2.5 bg-white text-blue-700 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-md">
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* No preferences CTA */}
        {!meta.hasPreferences && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center mb-8">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Set your travel preferences</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Tell us what you love and our AI will find perfect destinations just for you!
            </p>
            <Link to="/preferences" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              🌟 Choose My Interests
            </Link>
          </div>
        )}

        {/* Fallback notice */}
        {meta.isFallback && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-6 text-sm text-amber-700">
            <span>💡</span>
            <span>Showing top-rated destinations. <Link to="/preferences" className="font-semibold underline">Update preferences</Link> for personalized picks.</span>
          </div>
        )}

        {/* XAI Info Banner */}
        {showXAI && !loading && recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
            <div className="text-2xl">🧠</div>
            <div>
              <p className="text-sm font-bold text-violet-700">Explainable AI is ON</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Click <strong>"why?"</strong> on any destination card to see exactly why our AI recommended it for you!
              </p>
            </div>
          </div>
        )}

        {/* Category filter */}
        {recommendations.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === "all" ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"}`}>
              All ({recommendations.length})
            </button>
            {Object.entries(CATEGORY_META).map(([id, m]) => {
              const count = recommendations.filter(d => d.categories.includes(id)).length;
              if (count === 0) return null;
              return (
                <button key={id} onClick={() => setFilter(id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === id ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"}`}>
                  {m.emoji} {m.label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(dest => (
                <div key={dest._id} className="flex flex-col gap-2">
                  <DestinationCard
                    destination={dest}
                    showScore={true}
                    matchedCategories={dest.matchedCategories || []}
                  />
                  {/* AI Explanation below each card */}
                  {showXAI && (
                    <AIExplanation dest={dest} userPrefs={userPrefs} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-slate-400 mt-8">
              Showing {filtered.length} destination{filtered.length !== 1 ? "s" : ""} matched to your interests.
            </p>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏝️</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No destinations found</h3>
            <p className="text-slate-400 text-sm">Try selecting a different filter or update your preferences.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
