// ============================================================
// src/pages/DestinationDetailPage.js - WITH PDF DOWNLOAD
// ============================================================

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { destinationAPI, favoritesAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import BudgetCalculator from "../components/common/BudgetCalculator";
import MapBudgetSection from "../components/common/MapBudgetSection";
import TripSummaryPDF from "../components/common/TripSummaryPDF";
import ReviewSection from "../components/common/ReviewSection";
import WeatherWidget from "../components/common/WeatherWidget";
import { CATEGORY_META } from "../components/common/DestinationCard";
import toast from "react-hot-toast";

const StarRating = ({ rating }) => (
  <div className="flex">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`w-5 h-5 ${s <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </div>
);

const DestinationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [error, setError] = useState(null);
  const [travelInfo, setTravelInfo] = useState(null);
  const [budgetData, setBudgetData] = useState(null); // for PDF

  // eslint-disable-next-line
  useEffect(() => { fetchDestination(); }, [id]);

  const fetchDestination = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await destinationAPI.getById(id);
      if (res.data.success && res.data.destination) {
        setDestination(res.data.destination);
      } else {
        setError("Destination not found.");
      }
    } catch {
      setError("Could not load destination.");
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) { toast.error("Please login!"); return; }
    setFavLoading(true);
    try {
      if (favorited) {
        await favoritesAPI.removeFavorite(id);
        toast.success("Removed from wishlist");
        setFavorited(false);
      } else {
        await favoritesAPI.addFavorite(id);
        toast.success("Added to wishlist ❤️");
        setFavorited(true);
      }
    } catch { toast.error("Could not update wishlist"); }
    finally { setFavLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading destination...</p>
      </div>
    </div>
  );

  if (error || !destination) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Destination not found</h2>
        <p className="text-slate-400 text-sm mb-4">{error}</p>
        <button onClick={() => navigate("/explore")} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          ← Back to Explore
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${encodeURIComponent(destination.name)}/1200/600`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-all">
          ← Back
        </button>
        <button onClick={handleFavorite} disabled={favLoading}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${favorited ? "bg-red-500 text-white" : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"}`}>
          {favLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
            <svg className="w-5 h-5" fill={favorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>}
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {destination.categories?.map(cat => {
              const meta = CATEGORY_META[cat];
              return meta ? (
                <span key={cat} className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
                  {meta.emoji} {meta.label}
                </span>
              ) : null;
            })}
          </div>
          <h1 className="text-3xl font-bold text-white">{destination.name}</h1>
          <p className="text-white/80 text-sm mt-1">📍 {destination.location?.city}, {destination.location?.state}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Rating */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-4 flex-wrap">
            <StarRating rating={destination.rating} />
            <span className="font-bold text-slate-800 text-lg">{destination.rating?.toFixed(1)}</span>
            <span className="text-slate-400 text-sm">({destination.reviewCount?.toLocaleString()} reviews)</span>
            {destination.rankingString && (
              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                🏆 {destination.rankingString}
              </span>
            )}
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 text-lg mb-3">About</h2>
          <p className="text-slate-600 leading-relaxed text-sm">{destination.description}</p>
        </div>

        {/* Quick Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 text-lg mb-4">Quick Info</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "📅", label: "Best Time", value: destination.bestTimeToVisit || "Oct to Mar" },
              { icon: "🎫", label: "Entry Fee", value: destination.entryFee || "Check locally" },
              { icon: "📍", label: "Location", value: `${destination.location?.city}, ${destination.location?.state}` },
              { icon: "📞", label: "Contact", value: destination.phone || "N/A" },
            ].map(info => (
              <div key={info.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">{info.icon} {info.label}</p>
                <p className="text-sm font-semibold text-slate-700">{info.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activities */}
        {destination.popularActivities?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 text-lg mb-3">Popular Activities</h2>
            <div className="flex flex-wrap gap-2">
              {destination.popularActivities.map((a, i) => (
                <span key={i} className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Full Width Map */}
        <MapBudgetSection
          destination={destination}
          onTravelInfoChange={setTravelInfo}
        />

        {/* Budget Calculator */}
        <BudgetCalculator
          destination={destination}
          travelInfo={travelInfo}
          onBudgetChange={setBudgetData}
        />

        {/* PDF Download Button */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl">📄</div>
            <div>
              <h3 className="font-bold text-slate-800">Download Trip Summary</h3>
              <p className="text-xs text-slate-400">Get a professional PDF with itinerary, budget & location details</p>
            </div>
          </div>
          <TripSummaryPDF
            destination={destination}
            budgetData={budgetData}
            travelInfo={travelInfo}
          />
        </div>

        {/* Weather Widget */}
        <WeatherWidget destination={destination} />

        {/* Reviews & Voting */}
        <ReviewSection destination={destination} />

        {/* TripAdvisor */}
        {destination.tripAdvisorUrl && (
          <a href={destination.tripAdvisorUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors">
            View on TripAdvisor →
          </a>
        )}
      </div>
    </div>
  );
};

export default DestinationDetailPage;
