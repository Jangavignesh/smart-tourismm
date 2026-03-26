// ============================================================
// src/pages/ItineraryPage.js - AI Itinerary Generator
// Uses Anthropic Claude API to generate day-by-day plans
// ============================================================

import React, { useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const DESTINATIONS = [
  "Goa", "Jaipur", "Agra", "Varanasi", "Udaipur", "Manali", "Shimla",
  "Darjeeling", "Ooty", "Munnar", "Kochi", "Hampi", "Rishikesh",
  "Amritsar", "Jodhpur", "Mumbai", "Delhi", "Bangalore", "Chennai",
  "Kolkata", "Hyderabad", "Mysore", "Coorg", "Coimbatore", "Pushkar",
  "Leh", "Srinagar", "Dharamsala", "Nainital", "Mussoorie", "Haridwar",
  "Tirupati", "Madurai", "Kanyakumari", "Alleppey", "Wayanad", "Guwahati",
];

const TRAVEL_STYLES = [
  { id: "budget",    label: "Budget",    emoji: "💰" },
  { id: "comfort",   label: "Comfort",   emoji: "🏨" },
  { id: "luxury",    label: "Luxury",    emoji: "✨" },
  { id: "adventure", label: "Adventure", emoji: "🧗" },
  { id: "family",    label: "Family",    emoji: "👨‍👩‍👧" },
  { id: "romantic",  label: "Romantic",  emoji: "💑" },
];

const INTERESTS = [
  { id: "culture",    label: "Culture & History", emoji: "🏛️" },
  { id: "food",       label: "Food & Cuisine",    emoji: "🍽️" },
  { id: "nature",     label: "Nature & Wildlife", emoji: "🌿" },
  { id: "adventure",  label: "Adventure Sports",  emoji: "🧗" },
  { id: "spiritual",  label: "Spiritual & Temples",emoji: "🙏" },
  { id: "shopping",   label: "Shopping & Markets",emoji: "🛍️" },
];

// ── Day Card ─────────────────────────────────────────────────
const DayCard = ({ day, index }) => {
  const [expanded, setExpanded] = useState(true);

  const timeSlots = [
    { key: "morning",   label: "Morning",   emoji: "🌅", color: "bg-amber-50 border-amber-200" },
    { key: "afternoon", label: "Afternoon", emoji: "☀️", color: "bg-orange-50 border-orange-200" },
    { key: "evening",   label: "Evening",   emoji: "🌆", color: "bg-purple-50 border-purple-200" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
            {index + 1}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-base">{day.title || `Day ${index + 1}`}</p>
            <p className="text-xs text-slate-400">{day.theme || ""}</p>
          </div>
        </div>
        <span className="text-slate-400 text-sm">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3">
          {timeSlots.map(slot => day[slot.key] && (
            <div key={slot.key} className={`rounded-xl p-4 border ${slot.color}`}>
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                {slot.emoji} {slot.label}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">{day[slot.key]}</p>
            </div>
          ))}

          {day.tips && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs font-bold text-blue-600 mb-1">💡 Tips</p>
              <p className="text-xs text-blue-700">{day.tips}</p>
            </div>
          )}

          {day.estimatedCost && (
            <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3 border border-green-100">
              <span className="text-lg">💰</span>
              <div>
                <p className="text-xs font-bold text-green-700">Estimated Cost</p>
                <p className="text-sm text-green-600">{day.estimatedCost}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────
const ItineraryPage = () => {
  const [step, setStep] = useState(1); // 1=form, 2=loading, 3=result
  const [form, setForm] = useState({
    destination: "",
    days: 3,
    travelStyle: "comfort",
    interests: [],
    budget: "",
    month: "",
  });
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState("");

  const toggleInterest = (id) => {
    setForm(p => ({
      ...p,
      interests: p.interests.includes(id)
        ? p.interests.filter(i => i !== id)
        : [...p.interests, id],
    }));
  };

  const generateItinerary = async () => {
    if (!form.destination) { toast.error("Please select a destination!"); return; }
    if (form.interests.length === 0) { toast.error("Please select at least one interest!"); return; }

    setStep(2);
    setError("");

    try {
      const res = await api.post("/itinerary/generate", {
        destination: form.destination,
        days: form.days,
        travelStyle: form.travelStyle,
        interests: form.interests,
        budget: form.budget,
        month: form.month,
      });

      if (!res.data.success) throw new Error(res.data.message);

      const parsed = JSON.parse(res.data.text);
      setItinerary(parsed);
      setStep(3);
      toast.success(`🎉 ${form.days}-day ${form.destination} itinerary ready!`);
    } catch (err) {
      console.error("Itinerary error:", err);
      setError("Could not generate itinerary. Please try again.");
      setStep(1);
      toast.error("Generation failed. Try again!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setStep(1);
    setItinerary(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-blue-200 text-sm font-medium mb-1">✨ Powered by Claude AI</p>
          <h1 className="text-3xl font-bold mb-2">AI Itinerary Generator 🗺️</h1>
          <p className="text-blue-200 text-sm">Get a personalized day-by-day travel plan in seconds!</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── STEP 1: FORM ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  ❌ {error}
                </div>
              )}

              {/* Destination */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">📍 Destination *</label>
                <select value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 bg-white">
                  <option value="">Select destination...</option>
                  {DESTINATIONS.sort().map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  📅 Duration: <span className="text-blue-600">{form.days} Days</span>
                </label>
                <input type="range" min="1" max="10" value={form.days}
                  onChange={e => setForm(p => ({ ...p, days: parseInt(e.target.value) }))}
                  className="w-full accent-blue-600" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1 Day</span><span>5 Days</span><span>10 Days</span>
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">🎭 Travel Style *</label>
                <div className="grid grid-cols-3 gap-2">
                  {TRAVEL_STYLES.map(style => (
                    <button key={style.id} type="button"
                      onClick={() => setForm(p => ({ ...p, travelStyle: style.id }))}
                      className={`py-3 rounded-xl border-2 text-center transition-all ${form.travelStyle === style.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}>
                      <div className="text-xl">{style.emoji}</div>
                      <div className="text-xs font-semibold mt-1">{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  ❤️ Interests * <span className="font-normal text-slate-400">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS.map(interest => (
                    <button key={interest.id} type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`py-3 px-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${form.interests.includes(interest.id) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}>
                      <span className="text-xl">{interest.emoji}</span>
                      <span className="text-sm font-medium">{interest.label}</span>
                      {form.interests.includes(interest.id) && <span className="ml-auto text-blue-500">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">💰 Budget (optional)</label>
                  <select value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400">
                    <option value="">Any budget</option>
                    <option value="Under ₹2000/day">Under ₹2000/day</option>
                    <option value="₹2000-5000/day">₹2000-5000/day</option>
                    <option value="₹5000-10000/day">₹5000-10000/day</option>
                    <option value="Above ₹10000/day">Above ₹10000/day</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">📅 Travel Month (optional)</label>
                  <select value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400">
                    <option value="">Any month</option>
                    {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate button */}
              <button onClick={generateItinerary}
                disabled={!form.destination || form.interests.length === 0}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 text-base flex items-center justify-center gap-2">
                ✨ Generate My Itinerary
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: LOADING ── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="text-6xl mb-6 animate-bounce">🤖</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Claude AI is planning your trip...</h2>
            <p className="text-slate-400 text-sm mb-6">
              Generating a personalized {form.days}-day itinerary for {form.destination}
            </p>
            <div className="flex justify-center gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
            <p className="text-xs text-slate-300 mt-6">This usually takes 5-10 seconds...</p>
          </div>
        )}

        {/* ── STEP 3: RESULT ── */}
        {step === 3 && itinerary && (
          <div className="space-y-5">
            {/* Overview card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="text-blue-200 text-sm mb-1">✨ AI Generated Itinerary</p>
                  <h2 className="text-3xl font-bold">{itinerary.destination}</h2>
                  <p className="text-blue-200 mt-1">{itinerary.duration} · {itinerary.style}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handlePrint}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-xl border border-white/30 transition-all">
                    🖨️ Print
                  </button>
                  <button onClick={resetForm}
                    className="px-4 py-2 bg-white text-blue-700 text-sm font-bold rounded-xl hover:bg-blue-50 transition-all">
                    🔄 New Plan
                  </button>
                </div>
              </div>

              {itinerary.overview && (
                <p className="text-blue-100 text-sm mt-4 leading-relaxed">{itinerary.overview}</p>
              )}

              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { label: "Best Time", value: itinerary.bestTime || "Oct-Mar", emoji: "📅" },
                  { label: "Duration", value: itinerary.duration, emoji: "⏱️" },
                  { label: "Est. Cost", value: itinerary.totalEstimatedCost || "Varies", emoji: "💰" },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center border border-white/20">
                    <p className="text-xl">{s.emoji}</p>
                    <p className="text-xs font-bold mt-1">{s.value}</p>
                    <p className="text-xs text-blue-300">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Day cards */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-lg">📅 Day-by-Day Plan</h3>
              {(itinerary.days || []).map((day, i) => (
                <DayCard key={i} day={day} index={i} />
              ))}
            </div>

            {/* Generate again */}
            <button onClick={resetForm}
              className="w-full py-3 border-2 border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
              🔄 Generate Another Itinerary
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryPage;
