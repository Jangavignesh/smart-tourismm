// ============================================================
// src/pages/ExplorePage.js - FINAL VERSION
// 30+ destinations per city, accurate city filtering
// ============================================================

import React, { useState, useEffect } from "react";
import { destinationAPI } from "../utils/api";
import DestinationCard, { CATEGORY_META } from "../components/common/DestinationCard";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🌍" },
  ...Object.entries(CATEGORY_META).map(([id, m]) => ({ id, label: m.label, emoji: m.emoji }))
];

const CITIES = [
  "All Cities", "Agra", "Jaipur", "Goa", "Delhi", "Varanasi",
  "Udaipur", "Mumbai", "Mysore", "Amritsar", "Rishikesh",
  "Manali", "Ooty", "Darjeeling", "Kolkata", "Chennai",
  "Hampi", "Jodhpur", "Munnar", "Kochi", "Pushkar",
];

const ITEMS_PER_PAGE = 24;

const ExplorePage = () => {
  const [allDestinations, setAllDestinations] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeCity, setActiveCity] = useState("All Cities");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // cityStats removed - not needed in UI

  // Fetch ALL destinations once on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await destinationAPI.getAll({ limit: 500 });
        setAllDestinations(res.data.destinations || []);
        
      } catch {
        setAllDestinations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Apply filters whenever anything changes
  useEffect(() => {
    let result = [...allDestinations];

    // City filter — uses citySource field for accuracy
    if (activeCity !== "All Cities") {
      result = result.filter((d) => {
        const citySource = (d.citySource || "").toLowerCase();
        const cityLoc = (d.location?.city || "").toLowerCase();
        const stateLoc = (d.location?.state || "").toLowerCase();
        const address = (d.address || "").toLowerCase();
        const target = activeCity.toLowerCase();
        return (
          citySource.includes(target) ||
          cityLoc.includes(target) ||
          stateLoc.includes(target) ||
          address.includes(target)
        );
      });
    }

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((d) => d.categories.includes(activeCategory));
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        (d.location?.city || "").toLowerCase().includes(q) ||
        (d.location?.state || "").toLowerCase().includes(q) ||
        (d.citySource || "").toLowerCase().includes(q)
      );
    }

    setDisplayed(result);
    setPage(1);
  }, [activeCity, activeCategory, search, allDestinations]);

  // Pagination
  const totalPages = Math.ceil(displayed.length / ITEMS_PER_PAGE);
  const paginated = displayed.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Category counts based on current city
  const getCategoryCount = (catId) => {
    let base = [...allDestinations];
    if (activeCity !== "All Cities") {
      base = base.filter(d => {
        const src = (d.citySource || d.location?.city || "").toLowerCase();
        return src.includes(activeCity.toLowerCase());
      });
    }
    if (catId === "all") return base.length;
    return base.filter(d => d.categories.includes(catId)).length;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-2">Explore India 🇮🇳</h1>
          <p className="text-blue-200 mb-6">
            {loading
              ? "⏳ Loading destinations from 20 Indian cities..."
              : `${allDestinations.length}+ destinations across India — powered by TripAdvisor`}
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search places, cities, states..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 outline-none focus:bg-white/20 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* City Filter */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            📍 Filter by City
          </p>
          <div className="flex gap-2 flex-wrap">
            {CITIES.map((city) => {
              const count = city === "All Cities"
                ? allDestinations.length
                : allDestinations.filter(d =>
                    (d.citySource || d.location?.city || "").toLowerCase()
                      .includes(city.toLowerCase())
                  ).length;
              return (
                <button
                  key={city}
                  onClick={() => setActiveCity(city)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeCity === city
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {city} {!loading && count > 0 && (
                    <span className="ml-1 opacity-60">({count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active city result count */}
          {activeCity !== "All Cities" && (
            <p className="text-xs text-indigo-500 mt-2 font-medium">
              📍 {displayed.length} destinations found in {activeCity}
            </p>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            🏷️ Filter by Category
          </p>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => {
              const count = getCategoryCount(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {cat.emoji} {cat.label}
                  {count > 0 && (
                    <span className="ml-1.5 text-xs opacity-60">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            {loading
              ? "⏳ Fetching 30+ destinations per city, please wait (~15 seconds)..."
              : `Showing ${paginated.length} of ${displayed.length} destinations`}
          </p>
          {totalPages > 1 && (
            <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginated.map((dest) => (
                <DestinationCard key={dest._id} destination={dest} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  ← Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        page === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No destinations found</h3>
            <p className="text-slate-400 text-sm mb-4">
              {activeCity !== "All Cities"
                ? `No results in ${activeCity} for selected filters.`
                : "Try a different search or category."}
            </p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("all"); setActiveCity("All Cities"); }}
              className="text-blue-500 text-sm hover:underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
