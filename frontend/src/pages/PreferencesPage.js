// ============================================================
// src/pages/PreferencesPage.js - Travel Interests Selection
// ============================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../utils/api";
import toast from "react-hot-toast";

const INTEREST_OPTIONS = [
  { id: "nature", label: "Nature", emoji: "🌿", desc: "Mountains, forests, valleys, rivers", color: "border-green-300 bg-green-50 hover:bg-green-100", selectedColor: "border-green-500 bg-green-100 ring-green-400" },
  { id: "adventure", label: "Adventure", emoji: "🧗", desc: "Trekking, rafting, paragliding", color: "border-orange-300 bg-orange-50 hover:bg-orange-100", selectedColor: "border-orange-500 bg-orange-100 ring-orange-400" },
  { id: "food", label: "Food & Cuisine", emoji: "🍛", desc: "Street food, regional cuisines, culinary tours", color: "border-yellow-300 bg-yellow-50 hover:bg-yellow-100", selectedColor: "border-yellow-500 bg-yellow-100 ring-yellow-400" },
  { id: "historical", label: "Historical", emoji: "🏛️", desc: "Forts, temples, ancient ruins, UNESCO sites", color: "border-purple-300 bg-purple-50 hover:bg-purple-100", selectedColor: "border-purple-500 bg-purple-100 ring-purple-400" },
  { id: "hill_stations", label: "Hill Stations", emoji: "⛰️", desc: "Cool weather, scenic views, tea gardens", color: "border-sky-300 bg-sky-50 hover:bg-sky-100", selectedColor: "border-sky-500 bg-sky-100 ring-sky-400" },
  { id: "beach", label: "Beach & Coast", emoji: "🏖️", desc: "Beaches, water sports, sunsets", color: "border-cyan-300 bg-cyan-50 hover:bg-cyan-100", selectedColor: "border-cyan-500 bg-cyan-100 ring-cyan-400" },
  { id: "culture", label: "Culture & Arts", emoji: "🎭", desc: "Festivals, dance, music, crafts", color: "border-pink-300 bg-pink-50 hover:bg-pink-100", selectedColor: "border-pink-500 bg-pink-100 ring-pink-400" },
  { id: "wildlife", label: "Wildlife", emoji: "🐯", desc: "Safaris, national parks, bird watching", color: "border-amber-300 bg-amber-50 hover:bg-amber-100", selectedColor: "border-amber-500 bg-amber-100 ring-amber-400" },
];

const PreferencesPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Load existing preferences on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await userAPI.getPreferences();
        setSelected(res.data.preferences || []);
      } catch {
        // no existing prefs
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one interest!");
      return;
    }
    setLoading(true);
    try {
      await userAPI.savePreferences(selected);
      // Update user in context with new preferences
      updateUser({ ...user, preferences: selected });
      toast.success("Preferences saved! Getting your picks... 🎯");
      navigate("/recommendations");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-5xl block mb-4">🎯</span>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">What do you love to explore?</h1>
          <p className="text-slate-500">
            Select your travel interests and our AI will find the perfect destinations for you.
            <br />
            <span className="text-sm text-blue-500 font-medium">Choose as many as you like!</span>
          </p>
        </div>

        {/* Selection counter */}
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-sm text-slate-500">
            {selected.length === 0 ? "No interests selected" : `${selected.length} interest${selected.length > 1 ? "s" : ""} selected`}
          </span>
          {selected.length > 0 && (
            <button onClick={() => setSelected([])} className="text-xs text-red-400 hover:text-red-600 font-medium">
              Clear all
            </button>
          )}
        </div>

        {/* Interest Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {INTEREST_OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggle(opt.id)}
                className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left group ${
                  isSelected ? `${opt.selectedColor} ring-2 ring-offset-2` : opt.color
                }`}
              >
                {/* Checkmark */}
                <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300"
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <span className="text-4xl">{opt.emoji}</span>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{opt.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            disabled={loading || selected.length === 0}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              `🎯 Get My Recommendations (${selected.length})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
